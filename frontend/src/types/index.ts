export type UserRole = 'STUDENT' | 'ADMIN' | 'CONTRIBUTOR'
export type InstitutionType = 'UNIVERSITY' | 'COLLEGE' | 'SCHOOL'
export type ResourceType = 'NOTE' | 'PYQ' | 'SYLLABUS' | 'GUESS_PAPER'
export type RequestStatus = 'PENDING' | 'FULFILLED'
export type SubjectCategory = 'MAJOR' | 'MINOR' | 'MD' | 'AEC' | 'VAC' | 'SEC'

export interface Institution {
  id: string
  name: string
  slug: string
  type: InstitutionType
  logoUrl?: string
  programs?: Program[]
}

export interface Program {
  id: string
  name: string
  institutionId: string
  subjects?: Subject[]
  institution?: Institution
}

export interface Subject {
  id: string
  name: string
  programId: string
  semester: number
  category?: SubjectCategory
  program?: Program
}

export interface Resource {
  id: string
  title: string
  type: ResourceType
  fileUrl: string
  subjectId: string
  subject?: Subject
  uploaderName?: string
  downloadsCount: number
  isApproved: boolean
  isAiGenerated: boolean
  year?: number
  createdAt: string
}

export interface MaterialRequest {
  id: string
  studentName: string
  requestedMaterial: string
  contactEmail?: string
  status: RequestStatus
  createdAt: string
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
  total?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface AdminStats {
  totalResources: number
  totalDownloads: number
  pendingContributions: number
  openRequests: number
  totalInstitutions: number
}

export interface PlatformStats {
  totalResources: number
  totalDownloads: number
  totalInstitutions: number
  requestsFulfilled: number
}

export interface ResourceQueryParams {
  search?: string
  institutionSlug?: string
  programId?: string
  subjectId?: string
  type?: ResourceType
  category?: SubjectCategory
  year?: number
  sort?: 'newest' | 'popular'
  cursor?: string
  limit?: number
}

export interface CreateResourcePayload {
  title: string
  type: ResourceType
  fileUrl: string
  subjectId: string
  year?: number
  isAiGenerated: boolean
  uploaderName?: string
}

export interface ContributePayload {
  title: string
  type: ResourceType
  fileUrl: string
  subjectId: string
  year?: number
  isAiGenerated: boolean
  uploaderName?: string
  uploaderEmail?: string
}

export interface CreateRequestPayload {
  studentName: string
  requestedMaterial: string
  contactEmail?: string
}

// ─── Concerns Board ───────────────────────────────────────────────────────────

export type PostStatus = 'ACTIVE' | 'REMOVED'
export type PostCategory =
  | 'ACADEMICS'
  | 'INFRASTRUCTURE'
  | 'ADMINISTRATION'
  | 'TRANSPORT'
  | 'HOSTEL'
  | 'SPORTS_CULTURE'
  | 'OTHER'

export type PostSort = 'hot' | 'new' | 'top'

export interface PostAuthor {
  id: string
  name: string
  profilePicUrl: string | null
  university: string | null
  college: string | null
}

export interface ConcernPost {
  id: string
  title: string
  description: string | null
  imageUrl: string
  category: PostCategory
  status: PostStatus
  upvotesCount: number
  authorId: string
  author: PostAuthor
  createdAt: string
  hasVoted?: boolean
  _count: { comments: number }
}

export interface ConcernComment {
  id: string
  content: string
  postId: string
  authorId: string
  author: PostAuthor
  status: PostStatus
  upvotesCount: number
  hasVoted?: boolean
  createdAt: string
}

export interface ConcernPostDetail extends ConcernPost {
  comments: ConcernComment[]
}

export interface BoardPage {
  items: ConcernPost[]
  nextCursor: string | null
}

export interface StudentUser {
  id: string
  email: string
  name: string
  university: string | null
  college: string | null
  semester: number | null
  profilePicUrl: string | null
  role: string
}

export interface AuthResponse {
  token: string
  user: StudentUser
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
  university: string
  college: string
  semester: number
}

export interface CreatePostPayload {
  title: string
  description?: string
  imageUrl: string
  category: PostCategory
}

export interface BoardModerationPost {
  id: string
  title: string
  category: PostCategory
  status: PostStatus
  upvotesCount: number
  createdAt: string
  author: { id: string; name: string; email: string; university: string | null }
  _count: { comments: number; votes: number }
}

export interface BoardModerationComment {
  id: string
  content: string
  status: PostStatus
  upvotesCount: number
  createdAt: string
  author: { id: string; name: string; email: string }
  post: { id: string; title: string }
}

export interface BoardStats {
  totalPosts: number
  totalComments: number
  removedPosts: number
}
