import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ArrowLeft, BarChart3, Download, FileText } from 'lucide-react'

export function AssignmentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('ai-grader-token')
        const response = await fetch(`http://localhost:8000/results/stats/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [id])

  const handleDownloadCSV = async () => {
    const token = localStorage.getItem('ai-grader-token')
    const response = await fetch(`http://localhost:8000/results/marksheet/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `marksheet_${id}.csv`
    a.click()
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Assignment Results</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadCSV}>
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
          <Button onClick={() => navigate(`/stats/${id}`)}>
            <BarChart3 className="w-4 h-4" />
            View Stats
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : !stats || stats.total_students === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground">No submissions yet</h3>
              <p className="text-sm text-muted-foreground">Students haven't submitted their answer sheets yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">{stats.average}%</div>
                <p className="text-sm text-muted-foreground mt-1">Class Average</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-success">{stats.highest}</div>
                <p className="text-sm text-muted-foreground mt-1">Highest Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-destructive">{stats.lowest}</div>
                <p className="text-sm text-muted-foreground mt-1">Lowest Score</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.students.map((s: any) => (
                <div key={s.submission_id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{s.student_name}</p>
                    <p className="text-sm text-muted-foreground">{s.total_marks} marks</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/results/submission/${s.submission_id}`)}>
                    View Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}