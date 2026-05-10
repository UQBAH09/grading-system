import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

function getPercentageColor(pct: number) {
  if (pct >= 70) return 'text-success'
  if (pct >= 40) return 'text-warning'
  return 'text-destructive'
}

export function SubmissionResultsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('ai-grader-token')
        const response = await fetch(`http://localhost:8000/results/submission/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.detail || 'Failed to fetch results')
        }
        const data = await response.json()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (error) return (
    <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive">
      <AlertCircle className="w-5 h-5" /><span>{error}</span>
    </div>
  )
  if (!results) return null

  const overallPct = results.max_marks > 0 ? Math.round((results.total_marks / results.max_marks) * 100) : 0

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" />Back
      </Button>

      <div>
        <h2 className="text-2xl font-semibold text-foreground">Results</h2>
        <p className="text-muted-foreground mt-1">AI-generated grading and feedback</p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground">{results.total_marks}</div>
              <p className="text-sm text-muted-foreground mt-1">Marks Awarded</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">{results.max_marks}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Marks</p>
            </div>
            <div>
              <div className={cn('text-3xl font-bold', getPercentageColor(overallPct))}>{overallPct}%</div>
              <p className="text-sm text-muted-foreground mt-1">Percentage</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={results.total_marks} max={results.max_marks} showLabel />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Question Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {results.parts.map((part: any) => {
            const pct = part.max_marks > 0 ? Math.round((part.marks_awarded / part.max_marks) * 100) : 0
            const isExpanded = expanded === part.question_id
            return (
              <div key={part.question_id} className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : part.question_id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white',
                      pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-warning' : 'bg-destructive'
                    )}>
                      {part.label}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-foreground">{part.marks_awarded} / {part.max_marks} marks</div>
                      <div className={cn('text-sm', getPercentageColor(pct))}>{pct}%</div>
                    </div>
                  </div>
                  <Badge variant={pct >= 70 ? 'success' : pct >= 40 ? 'warning' : 'danger'}>
                    {pct >= 70 ? 'Good' : pct >= 40 ? 'Average' : 'Needs Work'}
                  </Badge>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border bg-muted/30">
                    <div className="pt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1">Your Answer</h4>
                        <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg">{part.extracted_text}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-success" />Feedback
                        </h4>
                        <p className="text-sm text-muted-foreground">{part.comments}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-warning" />How to Improve
                        </h4>
                        <p className="text-sm text-muted-foreground">{part.improvement}</p>
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