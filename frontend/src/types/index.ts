export type UserRole = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN' | 'CONTRIBUTOR'
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

/**
 * UPDATED: Matches your backend which sends 'items' instead of 'data'.
 * Includes 'success' because apiFetch returns the whole object for these routes.
 */
export interface PaginatedResult<T> {
  success?: boolean
  items: T[]
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

export interface CreateInstitutionPayload {
  name: string
  type: InstitutionType
  logoUrl?: string
}

export interface CreateProgramPayload {
  name: string
  institutionId: string
}

export interface CreateSubjectPayload {
  name: string
  programId: string
  semester: number
  category?: SubjectCategory
}

// ─── Concerns Board ───────────────────────────────────────────────────────────

export type PostStatus = 'ACTIVE' | 'REMOVED' | 'PENDING_REVIEW'
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
  nameIsPublic: boolean
  boardTosAccepted: boolean
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: StudentUser
}

export interface FundraiserStatus {
  totalRaised: number
  goal: number
  contributorCount: number
  percentFunded: number
}

export interface Donor {
  id: string
  donorName: string
  message: string | null
  amount: number | null
  isAnonymous: boolean
  createdAt: string
}

export interface FundraiserContribution {
  id: string
  amount: number
  paymentId: string | null
  donorName: string | null
  createdAt: string
}

export interface AdminUserEntry {
  id: string
  email: string
  name: string
  role: string
  university: string | null
  college: string | null
  isBanned: boolean
  banReason: string | null
  boardTosAccepted: boolean
  createdAt: string
  _count: { concernPosts: number; resources: number }
}

export interface AdminUsersPage {
  users: AdminUserEntry[]
  total: number
  page: number
  limit: number
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

export interface UploadUrlResponse {
  uploadUrl: string
  fileUrl: string
  key?: string
}

export interface AdminLoginResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

// ─── Admin Profiles ───────────────────────────────────────────────────────────

export interface AdminProfilePublic {
  id: string
  userId: string
  name: string
  role: string
  university: string
  program: string
  pfpUrl: string | null
  contactNo: string | null  // null when revoked
  isRevoked: boolean
  revokedAt: string | null
  joinedAt: string
}

export interface AdminProfileFull extends AdminProfilePublic {
  email: string
  userCreatedAt: string
}

export interface CreateAdminPayload {
  email: string
  name: string
  password: string
  university: string
  program: string
  contactNo?: string
}

export interface GenerateAdminPayload {
  university: string
  program: string
  contactNo?: string
}

export interface GenerateAdminResult {
  user: { id: string; email: string; name: string; role: string }
  profile: { id: string; userId: string }
  generatedPassword: string
  generatedEmail: string
}