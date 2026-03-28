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
