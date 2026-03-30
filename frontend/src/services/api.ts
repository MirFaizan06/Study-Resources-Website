import type {
  Institution,
  Program,
  Subject,
  Resource,
  MaterialRequest,
  AdminStats,
  PlatformStats,
  PaginatedResult,
  ResourceQueryParams,
  CreateResourcePayload,
  ContributePayload,
  CreateRequestPayload,
  AuthResponse,
  RegisterPayload,
  StudentUser,
  BoardPage,
  ConcernPostDetail,
  ConcernPost,
  ConcernComment,
  CreatePostPayload,
  PostCategory,
  PostSort,
  BoardModerationPost,
  BoardModerationComment,
  BoardStats,
  FundraiserStatus,
  AdminUsersPage,
} from '@/types'


const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getAdminToken(): string | null {
  return localStorage.getItem('admin_token')
}

function getStudentToken(): string | null {
  return localStorage.getItem('student_token')
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const adminToken = getAdminToken();
  const studentToken = getStudentToken();
  const token = adminToken ?? studentToken;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json() as { message?: string };
      if (errorBody.message) message = errorBody.message;
    } catch {
      // ignore JSON parse error
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const result = await response.json();

  // Global Unwrapper: Extract .data if the backend wrapped it
  if (
    result &&
    typeof result === 'object' &&
    result.success === true &&
    'data' in result
  ) {
    return result.data as T;
  }

  return result as T;
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  }
  const str = query.toString()
  return str ? `?${str}` : ''
}

export const api = {
  institutions: {
    getAll(): Promise<Institution[]> {
      return apiFetch<Institution[]>('/api/institutions');
    },

    getBySlug(slug: string): Promise<Institution> {
      return apiFetch<Institution>(`/api/institutions/${slug}`);
    },

    getProgram(programId: string): Promise<Program> {
      return apiFetch<Program>(`/api/institutions/programs/${programId}`);
    },

    getSubject(subjectId: string): Promise<Subject> {
      return apiFetch<Subject>(`/api/institutions/subjects/${subjectId}`);
    },
  },

  resources: {
    getAll(params: ResourceQueryParams): Promise<PaginatedResult<Resource>> {
      const query = buildQueryString(params as Record<string, string | number | boolean | undefined>);
      return apiFetch<PaginatedResult<Resource>>(`/api/resources${query}`);
    },

    getById(id: string): Promise<Resource> {
      return apiFetch<Resource>(`/api/resources/${id}`);
    },

    download(id: string): Promise<{ fileUrl: string }> {
      return apiFetch<{ fileUrl: string }>(`/api/resources/${id}/download`, {
        method: 'POST',
      });
    },

    requestUploadUrl(filename: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
      return apiFetch<{ uploadUrl: string; fileUrl: string }>('/api/resources/upload-url', {
        method: 'POST',
        body: JSON.stringify({ filename, contentType }),
      });
    },

    create(data: CreateResourcePayload): Promise<Resource> {
      return apiFetch<Resource>('/api/resources', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  requests: {
    create(data: CreateRequestPayload): Promise<void> {
      return apiFetch<void>('/api/requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  stats: {
    get(): Promise<PlatformStats> {
      return apiFetch<PlatformStats>('/api/stats');
    },
  },

  contribute: {
    submit(data: ContributePayload): Promise<void> {
      return apiFetch<void>('/api/contribute', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  auth: {
    register(data: RegisterPayload): Promise<AuthResponse> {
      return apiFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    login(email: string, password: string): Promise<AuthResponse> {
      return apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    me(): Promise<StudentUser> {
      return apiFetch<StudentUser>('/api/auth/me');
    },

    updateProfile(data: Partial<Omit<StudentUser, 'id' | 'email' | 'role'>>): Promise<StudentUser> {
      return apiFetch<StudentUser>('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    requestProfilePicUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
      return apiFetch<{ uploadUrl: string; fileUrl: string }>('/api/auth/profile-pic-url', {
        method: 'POST',
        body: JSON.stringify({ fileName, contentType }),
      });
    },

    refresh(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
      return apiFetch<{ token: string; refreshToken: string }>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    },

    logout(refreshToken: string): Promise<void> {
      return apiFetch<void>('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    },

    acceptBoardTos(): Promise<void> {
      return apiFetch<void>('/api/auth/accept-board-tos', { method: 'POST' });
    },
  },

  board: {
    getPosts(params: { sort?: PostSort; category?: PostCategory | 'ALL'; cursor?: string; limit?: number }): Promise<BoardPage> {
      const query = buildQueryString(params as Record<string, string | number | boolean | undefined>);
      return apiFetch<BoardPage>(`/api/board/posts${query}`);
    },

    getPost(id: string): Promise<ConcernPostDetail> {
      return apiFetch<ConcernPostDetail>(`/api/board/posts/${id}`);
    },

    requestImageUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
      return apiFetch<{ uploadUrl: string; fileUrl: string }>('/api/board/posts/image-url', {
        method: 'POST',
        body: JSON.stringify({ fileName, contentType }),
      });
    },

    createPost(data: CreatePostPayload): Promise<ConcernPost> {
      return apiFetch<ConcernPost>('/api/board/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    vote(postId: string): Promise<{ voted: boolean; upvotesCount: number }> {
      return apiFetch<{ voted: boolean; upvotesCount: number }>(`/api/board/posts/${postId}/vote`, { method: 'POST' });
    },

    deletePost(postId: string): Promise<void> {
      return apiFetch<void>(`/api/board/posts/${postId}`, { method: 'DELETE' });
    },

    addComment(postId: string, content: string): Promise<ConcernComment> {
      return apiFetch<ConcernComment>(`/api/board/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },

    deleteComment(postId: string, commentId: string): Promise<void> {
      return apiFetch<void>(`/api/board/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
    },

    voteComment(postId: string, commentId: string): Promise<{ voted: boolean; upvotesCount: number }> {
      return apiFetch<{ voted: boolean; upvotesCount: number }>(`/api/board/posts/${postId}/comments/${commentId}/vote`, { method: 'POST' });
    },
  },

  donors: {
    list(): Promise<Array<{ id: string; donorName: string; message: string | null; amount: number | null; isAnonymous: boolean; createdAt: string }>> {
      return apiFetch('/api/donors');
    },
    thank(data: { donorName?: string; message?: string; amount?: number; isAnonymous?: boolean; paymentId?: string }): Promise<void> {
      return apiFetch('/api/donors/thank', { method: 'POST', body: JSON.stringify(data) });
    },
  },

  fundraiser: {
    getStatus(): Promise<FundraiserStatus> {
      return apiFetch<FundraiserStatus>('/api/fundraiser');
    },
    contribute(data: { amount: number; paymentId?: string; donorName?: string }): Promise<void> {
      return apiFetch<void>('/api/fundraiser/contribute', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  admin: {
    login(email: string, password: string): Promise<{ token: string }> {
      return apiFetch<{ token: string }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    getStats(): Promise<AdminStats> {
      return apiFetch<AdminStats>('/api/admin/stats');
    },

    getPendingContributions(): Promise<Resource[]> {
      return apiFetch<Resource[]>('/api/admin/contributions/pending');
    },

    approveContribution(id: string): Promise<void> {
      return apiFetch<void>(`/api/admin/contributions/${id}/approve`, { method: 'POST' });
    },

    rejectContribution(id: string): Promise<void> {
      return apiFetch<void>(`/api/admin/contributions/${id}/reject`, { method: 'POST' });
    },

    getRequests(): Promise<MaterialRequest[]> {
      return apiFetch<MaterialRequest[]>('/api/admin/requests');
    },

    fulfillRequest(id: string): Promise<void> {
      return apiFetch<void>(`/api/admin/requests/${id}/fulfill`, { method: 'POST' });
    },

    requestUploadUrl(filename: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> {
      return apiFetch<{ uploadUrl: string; fileUrl: string }>('/api/admin/resources/upload-url', {
        method: 'POST',
        body: JSON.stringify({ filename, contentType }),
      });
    },

    createResource(data: CreateResourcePayload): Promise<Resource> {
      return apiFetch<Resource>('/api/admin/resources', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getModerationPosts(status?: string): Promise<BoardModerationPost[]> {
      const q = status ? `?status=${status}` : '';
      return apiFetch<BoardModerationPost[]>(`/api/admin/moderation/posts${q}`);
    },

    setPostStatus(id: string, status: 'ACTIVE' | 'REMOVED'): Promise<void> {
      return apiFetch<void>(`/api/admin/moderation/posts/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },

    getModerationComments(status?: string): Promise<BoardModerationComment[]> {
      const q = status ? `?status=${status}` : '';
      return apiFetch<BoardModerationComment[]>(`/api/admin/moderation/comments${q}`);
    },

    setCommentStatus(id: string, status: 'ACTIVE' | 'REMOVED'): Promise<void> {
      return apiFetch<void>(`/api/admin/moderation/comments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },

    getBoardStats(): Promise<BoardStats> {
      return apiFetch<BoardStats>('/api/admin/moderation/board-stats');
    },

    getUsers(page = 1): Promise<AdminUsersPage> {
      return apiFetch<AdminUsersPage>(`/api/admin/users?page=${page}&limit=50`);
    },

    banUser(id: string, reason?: string): Promise<void> {
      return apiFetch<void>(`/api/admin/users/${id}/ban`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    },

    unbanUser(id: string): Promise<void> {
      return apiFetch<void>(`/api/admin/users/${id}/unban`, { method: 'PATCH' });
    },
  },
};

export { ApiError }
