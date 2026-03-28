import type {
  Institution,
  Program,
  Subject,
  Resource,
  MaterialRequest,
  AdminStats,
  PaginatedResult,
  ResourceQueryParams,
  CreateResourcePayload,
  ContributePayload,
  CreateRequestPayload,
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

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  const token = getAdminToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const errorBody = await response.json() as { message?: string }
      if (errorBody.message) message = errorBody.message
    } catch {
      // ignore JSON parse error
    }
    throw new ApiError(message, response.status)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
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
      return apiFetch<Institution[]>('/api/institutions')
    },

    getBySlug(slug: string): Promise<Institution> {
      return apiFetch<Institution>(`/api/institutions/${slug}`)
    },

    getProgram(programId: string): Promise<Program> {
      return apiFetch<Program>(`/api/institutions/programs/${programId}`)
    },

    getSubject(subjectId: string): Promise<Subject> {
      return apiFetch<Subject>(`/api/institutions/subjects/${subjectId}`)
    },
  },

  resources: {
    getAll(params: ResourceQueryParams): Promise<PaginatedResult<Resource>> {
      const query = buildQueryString(params as Record<string, string | number | boolean | undefined>)
      return apiFetch<PaginatedResult<Resource>>(`/api/resources${query}`)
    },

    getById(id: string): Promise<Resource> {
      return apiFetch<Resource>(`/api/resources/${id}`)
    },

    download(id: string): Promise<{ fileUrl: string }> {
      return apiFetch<{ fileUrl: string }>(`/api/resources/${id}/download`, {
        method: 'POST',
      })
    },

    requestUploadUrl(
      filename: string,
      contentType: string
    ): Promise<{ uploadUrl: string; fileUrl: string }> {
      return apiFetch<{ uploadUrl: string; fileUrl: string }>(
        '/api/resources/upload-url',
        {
          method: 'POST',
          body: JSON.stringify({ filename, contentType }),
        }
      )
    },

    create(data: CreateResourcePayload): Promise<Resource> {
      return apiFetch<Resource>('/api/resources', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
  },

  requests: {
    create(data: CreateRequestPayload): Promise<void> {
      return apiFetch<void>('/api/requests', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
  },

  contribute: {
    submit(data: ContributePayload): Promise<void> {
      return apiFetch<void>('/api/contribute', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
  },

  admin: {
    login(email: string, password: string): Promise<{ token: string }> {
      return apiFetch<{ token: string }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    },

    getStats(): Promise<AdminStats> {
      return apiFetch<AdminStats>('/api/admin/stats')
    },

    getPendingContributions(): Promise<Resource[]> {
      return apiFetch<Resource[]>('/api/admin/contributions/pending')
    },

    approveContribution(id: string): Promise<void> {
      return apiFetch<void>(`/api/admin/contributions/${id}/approve`, {
        method: 'POST',
      })
    },

    rejectContribution(id: string): Promise<void> {
      return apiFetch<void>(`/api/admin/contributions/${id}/reject`, {
        method: 'POST',
      })
    },

    getRequests(): Promise<MaterialRequest[]> {
      return apiFetch<MaterialRequest[]>('/api/admin/requests')
    },

    fulfillRequest(id: string): Promise<void> {
      return apiFetch<void>(`/api/admin/requests/${id}/fulfill`, {
        method: 'POST',
      })
    },

    requestUploadUrl(
      filename: string,
      contentType: string
    ): Promise<{ uploadUrl: string; fileUrl: string }> {
      return apiFetch<{ uploadUrl: string; fileUrl: string }>(
        '/api/admin/resources/upload-url',
        {
          method: 'POST',
          body: JSON.stringify({ filename, contentType }),
        }
      )
    },

    createResource(data: CreateResourcePayload): Promise<Resource> {
      return apiFetch<Resource>('/api/admin/resources', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
  },
}

export { ApiError }
