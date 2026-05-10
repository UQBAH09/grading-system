import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useState, useEffect } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'

export function StatsPage() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const chartColors = {
    primary: theme === 'dark' ? '#3B7AB8' : '#2C5F8A',
    grid: theme === 'dark' ? '#334155' : '#E2E8F0',
    text: theme === 'dark' ? '#94A3B8' : '#64748B',
    tooltipBg: theme === 'dark' ? '#1E293B' : '#FFFFFF',
    tooltipBorder: theme === 'dark' ? '#334155' : '#E2E8F0',
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('ai-grader-token')
        const response = await fetch(`http://localhost:8000/results/stats/${examId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [examId])

  const handleDownloadCSV = async () => {
    const token = localStorage.getItem('ai-grader-token')
    const response = await fetch(`http://localhost:8000/results/marksheet/${examId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `marksheet_${examId}.csv`
    a.click()
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (error) return <div className="p-4 rounded-xl bg-destructive/10 text-destructive">{error}</div>
  if (!stats || stats.total_students === 0) return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" />Back
      </Button>
      <Card>
        <CardContent className="pt-6 text-center py-10">
          <p className="text-muted-foreground">No submissions yet for this assignment.</p>
        </CardContent>
      </Card>
    </div>
  )

  const studentData = stats.students.map((s: any) => ({
    name: s.student_name.split(' ')[0],
    'Total Marks': s.total_marks
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />Back
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Class Statistics</h2>
          <p className="text-muted-foreground mt-1">{stats.total_students} student{stats.total_students > 1 ? 's' : ''} submitted</p>
        </div>
        <Button variant="outline" onClick={handleDownloadCSV}>
          <Download className="w-4 h-4" />Download CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{stats.average}</div>
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

      {/* Student Score Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Student Score Comparison</CardTitle>
          <CardDescription>Total marks achieved by each student</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" tick={{ fill: chartColors.text, fontSize: 12 }} axisLine={{ stroke: chartColors.grid }} />
                <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} axisLine={{ stroke: chartColors.grid }} />
                <Tooltip contentStyle={{
                  backgroundColor: chartColors.tooltipBg,
                  border: `1px solid ${chartColors.tooltipBorder}`,
                  borderRadius: '12px',
                  color: theme === 'dark' ? '#E2E8F0' : '#1E293B',
                }} />
                <Bar dataKey="Total Marks" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader><CardTitle>Student Results</CardTitle></CardHeader>
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
    </div>
  )
}