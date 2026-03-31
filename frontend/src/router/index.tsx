import React, { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  Navigate,
  useParams,
  Outlet,
} from 'react-router-dom'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type LocaleCode } from '@/i18n'
import { RootLayout } from '@/layouts/RootLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

// ─── Lazy page imports ────────────────────────────────────────────────────────
const Home = lazy(() => import('@/pages/Home'))
const Institution = lazy(() => import('@/pages/Institution'))
const Resources = lazy(() => import('@/pages/Resources'))
const Contribute = lazy(() => import('@/pages/Contribute'))
const Request = lazy(() => import('@/pages/Request'))
const About = lazy(() => import('@/pages/About'))
const AIPage = lazy(() => import('@/pages/AI'))

const AdminLogin = lazy(() => import('@/pages/admin/Login'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminContributions = lazy(() => import('@/pages/admin/Contributions'))
const AdminRequests = lazy(() => import('@/pages/admin/Requests'))
const AdminUpload = lazy(() => import('@/pages/admin/Upload'))
const AdminModeration = lazy(() => import('@/pages/admin/Moderation'))
const AdminUsers = lazy(() => import('@/pages/admin/Users'))
const AdminInstitutions = lazy(() => import('@/pages/admin/Institutions'))
const AdminPrograms = lazy(() => import('@/pages/admin/Programs'))
const AdminSubjects = lazy(() => import('@/pages/admin/Subjects'))

const BoardPage = lazy(() => import('@/pages/Board'))
const PostDetailPage = lazy(() => import('@/pages/Board/PostDetail'))
const CreatePostPage = lazy(() => import('@/pages/Board/CreatePost'))
const LoginPage = lazy(() => import('@/pages/Auth/Login'))
const RegisterPage = lazy(() => import('@/pages/Auth/Register'))
const ProfilePage = lazy(() => import('@/pages/Profile'))
const LegalPage = lazy(() => import('@/pages/Legal'))
const SupportersPage = lazy(() => import('@/pages/Supporters'))
const BlogsPage = lazy(() => import('@/pages/Blogs'))
const RulesOfStudying = lazy(() => import('@/pages/Blogs/posts/RulesOfStudying'))
const StudyTechniques = lazy(() => import('@/pages/Blogs/posts/StudyTechniques'))
const SemesterPlanning = lazy(() => import('@/pages/Blogs/posts/SemesterPlanning'))
const TypesOfStudents = lazy(() => import('@/pages/Blogs/posts/TypesOfStudents'))
const DeepWork = lazy(() => import('@/pages/Blogs/posts/DeepWork'))
const StudyPlansPage = lazy(() => import('@/pages/StudyPlans'))
const ChangelogPage = lazy(() => import('@/pages/Changelog'))

// ─── Not Found page ───────────────────────────────────────────────────────────
function NotFound(): React.ReactElement {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <a
        href="/en/"
        style={{
          background: 'var(--primary)',
          color: '#fff',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Go to Home
      </a>
    </div>
  )
}

// ─── Loading fallback ─────────────────────────────────────────────────────────
function PageLoader(): React.ReactElement {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Locale Guard ─────────────────────────────────────────────────────────────
function LocaleGuard(): React.ReactElement {
  const { locale } = useParams<{ locale: string }>()

  if (!locale || !SUPPORTED_LOCALES.includes(locale as LocaleCode)) {
    // Reconstruct path without the bad locale prefix
    const path = window.location.pathname.replace(`/${locale}`, '') || '/'
    return <Navigate to={`/${DEFAULT_LOCALE}${path}`} replace />
  }

  return <Outlet />
}

// ─── Router definition ────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <Navigate to={`/${DEFAULT_LOCALE}/`} replace />,
  },

  // Locale-prefixed routes
  {
    path: '/:locale',
    element: <LocaleGuard />,
    children: [
      // Admin login (no layout)
      {
        path: 'admin/login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminLogin />
          </Suspense>
        ),
      },

      // Admin protected routes
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            ),
          },
          {
            path: 'contributions',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminContributions />
              </Suspense>
            ),
          },
          {
            path: 'institutions',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminInstitutions />
              </Suspense>
            ),
          },
          {
            path: 'programs',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminPrograms />
              </Suspense>
            ),
          },
          {
            path: 'subjects',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminSubjects />
              </Suspense>
            ),
          },
          {
            path: 'requests',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminRequests />
              </Suspense>
            ),
          },
          {
            path: 'upload',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminUpload />
              </Suspense>
            ),
          },
          {
            path: 'moderation',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminModeration />
              </Suspense>
            ),
          },
          {
            path: 'users',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminUsers />
              </Suspense>
            ),
          },
        ],
      },

      // Public routes with RootLayout
      {
        element: <RootLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <Home />
              </Suspense>
            ),
          },
          {
            path: 'resources',
            element: (
              <Suspense fallback={<PageLoader />}>
                <Resources />
              </Suspense>
            ),
          },
          {
            path: 'resources/:institutionSlug',
            element: (
              <Suspense fallback={<PageLoader />}>
                <Institution />
              </Suspense>
            ),
          },
          {
            path: 'resources/:institutionSlug/:programId',
            element: (
              <Suspense fallback={<PageLoader />}>
                <Resources />
              </Suspense>
            ),
          },
          {
            path: 'resources/:institutionSlug/:programId/:subjectId',
            element: (
              <Suspense fallback={<PageLoader />}>
                <Resources />
              </Suspense>
            ),
          },
          {
            path: 'contribute',
            element: (
              <Suspense fallback={<PageLoader />}>
                <Contribute />
              </Suspense>
            ),
          },
          {
            path: 'request',
            element: (
              <Suspense fallback={<PageLoader />}>
                <Request />
              </Suspense>
            ),
          },
          {
            path: 'about',
            element: (
              <Suspense fallback={<PageLoader />}>
                <About />
              </Suspense>
            ),
          },
          {
            path: 'ai',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AIPage />
              </Suspense>
            ),
          },
          {
            path: 'board',
            element: (
              <Suspense fallback={<PageLoader />}>
                <BoardPage />
              </Suspense>
            ),
          },
          {
            path: 'board/create',
            element: (
              <Suspense fallback={<PageLoader />}>
                <CreatePostPage />
              </Suspense>
            ),
          },
          {
            path: 'board/:postId',
            element: (
              <Suspense fallback={<PageLoader />}>
                <PostDetailPage />
              </Suspense>
            ),
          },
          {
            path: 'login',
            element: (
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            ),
          },
          {
            path: 'register',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RegisterPage />
              </Suspense>
            ),
          },
          {
            path: 'profile',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            path: 'legal',
            element: (
              <Suspense fallback={<PageLoader />}>
                <LegalPage />
              </Suspense>
            ),
          },
          {
            path: 'supporters',
            element: (
              <Suspense fallback={<PageLoader />}>
                <SupportersPage />
              </Suspense>
            ),
          },
          // ─── Study Blogs ────────────────────────────────────────────────
          {
            path: 'blogs',
            element: (
              <Suspense fallback={<PageLoader />}>
                <BlogsPage />
              </Suspense>
            ),
          },
          {
            path: 'blogs/rules-of-studying',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RulesOfStudying />
              </Suspense>
            ),
          },
          {
            path: 'blogs/study-techniques',
            element: (
              <Suspense fallback={<PageLoader />}>
                <StudyTechniques />
              </Suspense>
            ),
          },
          {
            path: 'blogs/semester-planning',
            element: (
              <Suspense fallback={<PageLoader />}>
                <SemesterPlanning />
              </Suspense>
            ),
          },
          {
            path: 'blogs/types-of-students',
            element: (
              <Suspense fallback={<PageLoader />}>
                <TypesOfStudents />
              </Suspense>
            ),
          },
          {
            path: 'blogs/deep-work',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DeepWork />
              </Suspense>
            ),
          },
          // ─── Study Plans ────────────────────────────────────────────────
          {
            path: 'study-plans',
            element: (
              <Suspense fallback={<PageLoader />}>
                <StudyPlansPage />
              </Suspense>
            ),
          },
          // ─── Changelog ──────────────────────────────────────────────────
          {
            path: 'changelog',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ChangelogPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // Catch all 404
  {
    path: '*',
    element: <NotFound />,
  },
])
