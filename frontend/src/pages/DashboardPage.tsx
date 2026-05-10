import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { Upload, FileText, BarChart3, BookOpen, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Spinner } from '@/components/ui/Spinner'

function PersonalDashboard() {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem('ai-grader-token')
        const response = await fetch('http://localhost:8000/personal/submissions', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setSubmissions(data.submissions)
        }
      } catch (err) {
        console.error('Failed to fetch submissions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Personal Dashboard</h2>
          <p className="text-muted-foreground mt-1">Your grading submissions and results</p>
        </div>
        <Button onClick={() => navigate('/personal/upload')}>
          <Upload className="w-4 h-4" />
          New Submission
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground">No submissions yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Upload your first answer sheet to get started</p>
              <Button onClick={() => navigate('/personal/upload')}>Upload Now</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <Card key={sub.submission_id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{sub.answer_file_path}</p>
                      <p className="text-xs text-muted-foreground">{new Date(sub.submitted_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sub.status === 'done' ? 'bg-success/15 text-success' :
                      sub.status === 'failed' ? 'bg-destructive/15 text-destructive' :
                      'bg-warning/15 text-warning'
                    }`}>
                      {sub.status}
                    </span>
                    {sub.status === 'done' && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/personal/results/${sub.submission_id}`)}
                      >
                        View Results
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function TeacherDashboard() {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem('ai-grader-token')
        const response = await fetch('http://localhost:8000/results/assignments', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setAssignments(data.assignments)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Teacher Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage your assignments</p>
        </div>
        <Button onClick={() => navigate('/assignment/create')}>
          <BookOpen className="w-4 h-4" />
          Create Assignment
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground">No assignments yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first assignment to get started</p>
              <Button onClick={() => navigate('/assignment/create')}>Create Assignment</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <Card key={a.assignment_id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      a.has_scheme ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                    }`}>
                      {a.has_scheme ? 'Scheme uploaded' : 'No scheme yet'}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/assignment/${a.assignment_id}`)}>
                      View
                    </Button>
                    <Button size="sm" onClick={() => navigate(`/stats/${a.assignment_id}`)}>
                      Stats
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function StudentDashboard() {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem('ai-grader-token')
        const response = await fetch('http://localhost:8000/results/my-submissions', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setSubmissions(data.submissions)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Student Dashboard</h2>
          <p className="text-muted-foreground mt-1">Your submissions and results</p>
        </div>
        <Button onClick={() => navigate('/assignments')}>
          <FileText className="w-4 h-4" />
          View Assignments
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground">No submissions yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Go to assignments to submit your answer sheets</p>
              <Button onClick={() => navigate('/assignments')}>Browse Assignments</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <Card key={sub.submission_id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{sub.assignment_title || 'Assignment'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(sub.submitted_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sub.status === 'done' ? 'bg-success/15 text-success' :
                      sub.status === 'failed' ? 'bg-destructive/15 text-destructive' :
                      'bg-warning/15 text-warning'
                    }`}>
                      {sub.status === 'done' ? 'Graded' : sub.status}
                    </span>
                    {sub.status === 'done' && (
                      <Button size="sm" onClick={() => navigate(`/results/submission/${sub.submission_id}`)}>
                        View Results
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()

  if (user?.role === 'personal') return <PersonalDashboard />
  if (user?.role === 'teacher') return <TeacherDashboard />
  if (user?.role === 'student') return <StudentDashboard />

  return null
}