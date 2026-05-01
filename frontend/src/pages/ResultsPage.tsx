import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Progress } from '@/components/ui/Progress'
import { mockResults, getPercentageColor } from '@/lib/data'
import { BarChart3, Download, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ResultsPage() {
  const { examId } = useParams()
  const navigate = useNavigate()

  const handleViewStudent = (sheetId: number) => {
    navigate(`/student/${sheetId}`)
  }

  const handleViewStats = () => {
    navigate(`/stats/${examId}`)
  }

  // Calculate class statistics
  const totalStudents = mockResults.length
  const averageScore = mockResults.reduce((acc, r) => acc + (r.total_marks / r.max_marks) * 100, 0) / totalStudents
  const highestScore = Math.max(...mockResults.map(r => (r.total_marks / r.max_marks) * 100))
  const lowestScore = Math.min(...mockResults.map(r => (r.total_marks / r.max_marks) * 100))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Exam Results</h2>
          <p className="text-muted-foreground mt-1">
            Midterm Exam - Mathematics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={handleViewStats}>
            <BarChart3 className="w-4 h-4" />
            View Stats
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{totalStudents}</div>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{averageScore.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Class Average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{highestScore.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Highest Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{lowestScore.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Lowest Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead className="w-48">Percentage</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockResults.map((result) => {
                const percentage = Math.round((result.total_marks / result.max_marks) * 100)
                return (
                  <TableRow
                    key={result.sheet_id}
                    className="cursor-pointer"
                    onClick={() => handleViewStudent(result.sheet_id)}
                  >
                    <TableCell className="font-medium">{result.student_name}</TableCell>
                    <TableCell className="text-muted-foreground">{result.student_id}</TableCell>
                    <TableCell>{result.total_marks}</TableCell>
                    <TableCell>{result.max_marks}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={result.total_marks} max={result.max_marks} className="flex-1" />
                        <span className={cn('text-sm font-medium min-w-[3rem]', getPercentageColor(percentage))}>
                          {percentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
