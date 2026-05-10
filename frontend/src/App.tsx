import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { UploadPage } from './pages/UploadPage'
import { ResultsPage } from './pages/ResultsPage'
import { StudentDetailPage } from './pages/StudentDetailPage'
import { StatsPage } from './pages/StatsPage'
import { PersonalUploadPage } from './pages/PersonalUploadPage'
import { PersonalResultsPage } from './pages/PersonalResultsPage'
import { CreateAssignmentPage } from './pages/CreateAssignmentPage'
import { AssignmentPage } from './pages/AssignmentPage'
import { StudentAssignmentsPage } from './pages/StudentAssignmentsPage'
import { StudentUploadPage } from './pages/StudentUploadPage'
import { SubmissionResultsPage } from './pages/SubmissionResultsPage'
import { useAuth } from './contexts/AuthContext'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="upload/:examId" element={<UploadPage />} />
        <Route path="results/:examId" element={<ResultsPage />} />
        <Route path="student/:sheetId" element={<StudentDetailPage />} />
        <Route path="stats/:examId" element={<StatsPage />} />
        <Route path="personal/upload" element={<PersonalUploadPage />} />
        <Route path="personal/results/:id" element={<PersonalResultsPage />} />
        <Route path="assignment/create" element={<CreateAssignmentPage />} />
        <Route path="assignment/:id" element={<AssignmentPage />} />
        <Route path="assignments" element={<StudentAssignmentsPage />} />
        <Route path="student/upload/:assignmentId" element={<StudentUploadPage />} />
        <Route path="results/submission/:id" element={<SubmissionResultsPage />} />
      </Route>
    </Routes>
  )
}

export default App