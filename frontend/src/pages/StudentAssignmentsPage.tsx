import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { FileText, Upload, BookOpen, CheckCircle } from 'lucide-react'

export function StudentAssignmentsPage() {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('ai-grader-token')

        const [assignRes, subRes] = await Promise.all([
          fetch('http://localhost:8000/results/assignments', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:8000/results/my-submissions', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        if (assignRes.ok) {
          const data = await assignRes.json()
          setAssignments(data.assignments)
        }
        if (subRes.ok) {
          const data = await subRes.json()
          setSubmissions(data.submissions)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getSubmission = (assignmentId: number) => {
    return submissions.find(s => s.assignment_id === assignmentId)
  }

  const unsubmittedAssignments = assignments.filter(a => !getSubmission(a.assignment_id))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">My Assignments</h2>
        <p className="text-muted-foreground mt-1">Submit your answer sheets for AI grading</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground">No assignments yet</h3>
              <p className="text-sm text-muted-foreground">Your teacher hasn't created any assignments yet</p>
            </div>
          </CardContent>
        </Card>
      ) : unsubmittedAssignments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="font-medium text-foreground">All assignments submitted!</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Check your dashboard to view your results
              </p>
              <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {unsubmittedAssignments.map((a) => (
            <Card key={a.assignment_id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      a.has_scheme
                        ? 'bg-success/15 text-success'
                        : 'bg-warning/15 text-warning'
                    }`}>
                      {a.has_scheme ? 'Ready to submit' : 'Scheme pending'}
                    </span>
                    {a.has_scheme && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/student/upload/${a.assignment_id}`)}
                      >
                        <Upload className="w-4 h-4" />
                        Submit
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