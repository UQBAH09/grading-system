import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { mockStudentDetail, getPercentageColor, getPercentageBgColor } from '@/lib/data'
import { ArrowLeft, Download, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function StudentDetailPage() {
  const { sheetId } = useParams()
  const navigate = useNavigate()
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  const student = mockStudentDetail
  const overallPercentage = Math.round((student.total_marks / student.max_marks) * 100)

  const toggleQuestion = (question: string) => {
    setExpandedQuestion(expandedQuestion === question ? null : question)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{student.student_name}</h2>
              <p className="text-muted-foreground mt-1">Student ID: {student.student_id}</p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-foreground">{student.total_marks}</div>
              <p className="text-sm text-muted-foreground">Total Marks</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-foreground">{student.max_marks}</div>
              <p className="text-sm text-muted-foreground">Max Marks</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className={cn('text-2xl font-bold', getPercentageColor(overallPercentage))}>
                {overallPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">Percentage</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-foreground">
                {student.questions.filter(q => q.verified).length}/{student.questions.length}
              </div>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
            <Progress value={student.total_marks} max={student.max_marks} showLabel />
          </div>
        </CardContent>
      </Card>

      {/* Question Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Question-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {student.questions.map((q) => {
            const qPercentage = Math.round((q.marks_awarded / q.max_marks) * 100)
            const isExpanded = expandedQuestion === q.question

            return (
              <div
                key={q.question}
                className={cn(
                  'rounded-xl border border-border overflow-hidden transition-all duration-200',
                  isExpanded && 'shadow-md'
                )}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleQuestion(q.question)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-primary-foreground',
                      getPercentageBgColor(qPercentage)
                    )}>
                      Q{q.question}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-foreground">
                        {q.marks_awarded} / {q.max_marks} marks
                      </div>
                      <div className={cn('text-sm', getPercentageColor(qPercentage))}>
                        {qPercentage}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {q.verified ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Needs Review
                      </Badge>
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border bg-muted/30">
                    <div className="pt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1">Comments</h4>
                        <p className="text-sm text-muted-foreground">{q.comments}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1">Improvement Suggestions</h4>
                        <p className="text-sm text-muted-foreground">{q.suggestions}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
