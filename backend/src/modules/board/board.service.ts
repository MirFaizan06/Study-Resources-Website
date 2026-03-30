import { PostCategory, Prisma } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/errorHandler';
import { cache, TTL } from '../../utils/cache';
import type { CreatePost, ListPosts, CreateComment } from './board.schema';

// ─── Text sanitisation ────────────────────────────────────────────────────────
// Strip ALL HTML tags — board posts are plain text, not rich content.
const sanitizeText = (input: string): string =>
  sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();

// ─── Safe author shape ────────────────────────────────────────────────────────
const authorSelect = {
  id: true,
  name: true,
  nameIsPublic: true,
  profilePicUrl: true,
  university: true,
  college: true,
} as const;

// Mask name if user chose to keep it private
function maskAuthor<T extends { name: string; nameIsPublic: boolean }>(
  author: T
): Omit<T, 'nameIsPublic'> & { name: string } {
  const { nameIsPublic, ...rest } = author;
  return { ...rest, name: nameIsPublic ? author.name : 'Anonymous' };
}

// ─── Hot score (Reddit-style, no SQL needed) ─────────────────────────────────
function hotScore(upvotes: number, createdAt: Date): number {
  const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  return upvotes / Math.pow(ageHours + 2, 1.5);
}

// ─── List posts ───────────────────────────────────────────────────────────────
export async function listPosts(
  params: ListPosts,
  viewerId?: string
) {
  const { sort, category, cursor, limit } = params;

  const where: Prisma.ConcernPostWhereInput = {
    status: 'ACTIVE',   // only approved posts are shown publicly
    ...(category !== 'ALL' && { category: category as PostCategory }),
  };

  // For 'hot': fetch recent 200 posts, sort in JS, then paginate.
  // The sorted array is cached for 30s since it's CPU-heavy and rarely changes.
  if (sort === 'hot') {
    const hotCacheKey = `board:hot:${category}`;

    // Use a concrete query to derive the type
    const hotQuery = async () => prisma.concernPost.findMany({
      where: { ...where, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      take: 200,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: authorSelect },
        _count: { select: { comments: { where: { status: 'ACTIVE' } } } },
      },
    });
    type HotPost = Awaited<ReturnType<typeof hotQuery>>[number];
    type ScoredPost = HotPost & { _score: number };

    let scored = cache.get<ScoredPost[]>(hotCacheKey);

    if (!scored) {
      const posts = await hotQuery();
      scored = posts
        .map((p) => ({ ...p, _score: hotScore(p.upvotesCount, p.createdAt) }))
        .sort((a, b) => b._score - a._score);
      cache.set(hotCacheKey, scored, TTL.BOARD_HOT);
    }

    const cursorIdx = cursor ? scored.findIndex((p) => p.id === cursor) : -1;
    const start = cursorIdx >= 0 ? cursorIdx + 1 : 0;
    const page = scored.slice(start, start + limit);
    const nextCursor = page.length === limit ? page[page.length - 1]?.id : null;

    return {
      items: enrichWithVote(page.map((p) => ({ ...p, author: maskAuthor(p.author) })), viewerId),
      nextCursor,
    };
  }

  // new / top — cursor-based DB pagination
  const orderBy: Prisma.ConcernPostOrderByWithRelationInput =
    sort === 'top' ? { upvotesCount: 'desc' } : { createdAt: 'desc' };

  const cursorObj = cursor ? { id: cursor } : undefined;

  const posts = await prisma.concernPost.findMany({
    where,
    take: limit + 1,
    cursor: cursorObj,
    skip: cursor ? 1 : 0,
    orderBy,
    include: {
      author: { select: authorSelect },
      _count: { select: { comments: { where: { status: 'ACTIVE' } } } },
    },
  });

  const hasMore = posts.length > limit;
  const page = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

  return {
    items: enrichWithVote(page.map((p) => ({ ...p, author: maskAuthor(p.author) })), viewerId),
    nextCursor,
  };
}

// ─── Get single post ──────────────────────────────────────────────────────────
export async function getPost(id: string, viewerId?: string) {
  const post = await prisma.concernPost.findUnique({
    where: { id },
    include: {
      author: { select: authorSelect },
      _count: { select: { comments: { where: { status: 'ACTIVE' } } } },
      comments: {
        where: { status: 'ACTIVE' },
        orderBy: { upvotesCount: 'desc' },
        include: {
          author: { select: authorSelect },
        },
      },
    },
  });

  if (!post || post.status === 'REMOVED' || post.status === 'PENDING_REVIEW') {
    throw new AppError('Post not found.', 404, 'NOT_FOUND');
  }

  let hasVoted = false;
  if (viewerId) {
    const vote = await prisma.concernVote.findUnique({
      where: { postId_userId: { postId: id, userId: viewerId } },
    });
    hasVoted = !!vote;
  }

  // Enrich comments with vote info
  let commentVotedIds: Set<string> = new Set();
  if (viewerId && post.comments.length > 0) {
    const cvotes = await prisma.commentVote.findMany({
      where: {
        userId: viewerId,
        commentId: { in: post.comments.map((c) => c.id) },
      },
      select: { commentId: true },
    });
    commentVotedIds = new Set(cvotes.map((v) => v.commentId));
  }

  return {
    ...post,
    author: maskAuthor(post.author),
    hasVoted,
    comments: post.comments.map((c) => ({
      ...c,
      author: maskAuthor(c.author),
      hasVoted: commentVotedIds.has(c.id),
    })),
  };
}

// ─── Create post ──────────────────────────────────────────────────────────────
export async function createPost(data: CreatePost, authorId: string) {
  // Require Board ToS acceptance
  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: { boardTosAccepted: true, isBanned: true },
  });
  if (!author) throw new AppError('User not found.', 404, 'NOT_FOUND');
  if (author.isBanned) throw new AppError('Your account has been suspended.', 403, 'ACCOUNT_BANNED');
  if (!author.boardTosAccepted) {
    throw new AppError(
      'You must agree to the Board Terms of Service before posting.',
      403,
      'TOS_NOT_ACCEPTED'
    );
  }

  // Enforce 1 post per week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentPost = await prisma.concernPost.findFirst({
    where: { authorId, createdAt: { gte: weekAgo } },
    select: { id: true, createdAt: true },
  });
  if (recentPost) {
    const nextAllowed = new Date(recentPost.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const hoursLeft = Math.ceil((nextAllowed.getTime() - Date.now()) / (1000 * 60 * 60));
    throw new AppError(
      `You can only post once per week. You can post again in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}.`,
      429,
      'RATE_LIMIT'
    );
  }

  const post = await prisma.concernPost.create({
    data: {
      title: sanitizeText(data.title),
      description: data.description ? sanitizeText(data.description) : null,
      imageUrl: data.imageUrl ?? null,
      category: data.category as PostCategory,
      status: 'PENDING_REVIEW',
      authorId,
    },
    include: {
      author: { select: authorSelect },
      _count: { select: { comments: true } },
    },
  });

  return { ...post, author: maskAuthor(post.author) };
}

// ─── Toggle vote ──────────────────────────────────────────────────────────────
export async function toggleVote(
  postId: string,
  userId: string
): Promise<{ voted: boolean; upvotesCount: number }> {
  const post = await prisma.concernPost.findUnique({
    where: { id: postId },
    select: { id: true, status: true },
  });
  if (!post || post.status === 'REMOVED') {
    throw new AppError('Post not found.', 404, 'NOT_FOUND');
  }

  const existing = await prisma.concernVote.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    // Un-vote
    await prisma.$transaction([
      prisma.concernVote.delete({ where: { id: existing.id } }),
      prisma.concernPost.update({
        where: { id: postId },
        data: { upvotesCount: { decrement: 1 } },
      }),
    ]);
    const updated = await prisma.concernPost.findUnique({
      where: { id: postId },
      select: { upvotesCount: true },
    });
    return { voted: false, upvotesCount: updated?.upvotesCount ?? 0 };
  } else {
    // Vote
    await prisma.$transaction([
      prisma.concernVote.create({ data: { postId, userId } }),
      prisma.concernPost.update({
        where: { id: postId },
        data: { upvotesCount: { increment: 1 } },
      }),
    ]);
    const updated = await prisma.concernPost.findUnique({
      where: { id: postId },
      select: { upvotesCount: true },
    });
    return { voted: true, upvotesCount: updated?.upvotesCount ?? 0 };
  }
}

// ─── Delete post ──────────────────────────────────────────────────────────────
export async function deletePost(postId: string, userId: string, isAdmin: boolean) {
  const post = await prisma.concernPost.findUnique({ where: { id: postId } });
  if (!post) throw new AppError('Post not found.', 404, 'NOT_FOUND');
  if (!isAdmin && post.authorId !== userId) {
    throw new AppError('You can only delete your own posts.', 403, 'FORBIDDEN');
  }
  await prisma.concernPost.update({
    where: { id: postId },
    data: { status: 'REMOVED' },
  });
}

// ─── Add comment ──────────────────────────────────────────────────────────────
export async function addComment(
  postId: string,
  authorId: string,
  data: CreateComment
) {
  const post = await prisma.concernPost.findUnique({
    where: { id: postId },
    select: { id: true, status: true },
  });
  if (!post || post.status === 'REMOVED') {
    throw new AppError('Post not found.', 404, 'NOT_FOUND');
  }

  return prisma.concernComment.create({
    data: { content: sanitizeText(data.content), postId, authorId },
    include: { author: { select: authorSelect } },
  });
}

// ─── Delete comment ───────────────────────────────────────────────────────────
export async function deleteComment(
  commentId: string,
  userId: string,
  isAdmin: boolean
) {
  const comment = await prisma.concernComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new AppError('Comment not found.', 404, 'NOT_FOUND');
  if (!isAdmin && comment.authorId !== userId) {
    throw new AppError('You can only delete your own comments.', 403, 'FORBIDDEN');
  }
  await prisma.concernComment.update({
    where: { id: commentId },
    data: { status: 'REMOVED' },
  });
}

// ─── Toggle comment vote ──────────────────────────────────────────────────────
export async function toggleCommentVote(
  commentId: string,
  userId: string
): Promise<{ voted: boolean; upvotesCount: number }> {
  const comment = await prisma.concernComment.findUnique({
    where: { id: commentId },
    select: { id: true, status: true },
  });
  if (!comment || comment.status === 'REMOVED') {
    throw new AppError('Comment not found.', 404, 'NOT_FOUND');
  }

  const existing = await prisma.commentVote.findUnique({
    where: { commentId_userId: { commentId, userId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.commentVote.delete({ where: { id: existing.id } }),
      prisma.concernComment.update({
        where: { id: commentId },
        data: { upvotesCount: { decrement: 1 } },
      }),
    ]);
    const updated = await prisma.concernComment.findUnique({
      where: { id: commentId },
      select: { upvotesCount: true },
    });
    return { voted: false, upvotesCount: updated?.upvotesCount ?? 0 };
  } else {
    await prisma.$transaction([
      prisma.commentVote.create({ data: { commentId, userId } }),
      prisma.concernComment.update({
        where: { id: commentId },
        data: { upvotesCount: { increment: 1 } },
      }),
    ]);
    const updated = await prisma.concernComment.findUnique({
      where: { id: commentId },
      select: { upvotesCount: true },
    });
    return { voted: true, upvotesCount: updated?.upvotesCount ?? 0 };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function enrichWithVote<T extends { id: string }>(
  posts: T[],
  _viewerId?: string
): T[] {
  // hasVoted will be resolved client-side via separate call or ignored for list view
  return posts;
}
