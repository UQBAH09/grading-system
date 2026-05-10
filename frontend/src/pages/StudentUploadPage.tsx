import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/ui/FileUpload'
import { Spinner } from '@/components/ui/Spinner'
import { CheckCircle, AlertCircle, FileText } from 'lucide-react'

type Status = 'idle' | 'uploading' | 'pending' | 'extracting' | 'grading' | 'done' | 'failed'

const STATUS_MESSAGES: Record<Status, string> = {
  idle: '',
  uploading: 'Uploading your answer sheet...',
  pending: 'Waiting in queue...',
  extracting: 'Extracting text from your answer sheet...',
  grading: 'AI is grading your answers...',
  done: 'Grading complete!',
  failed: 'Something went wrong. Please try again.',
}

export function StudentUploadPage() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [answerFile, setAnswerFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!submissionId) return

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('ai-grader-token')
        const response = await fetch(`http://localhost:8000/grade/status/${submissionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) return
        const data = await response.json()

        if (data.status === 'done') {
          clearInterval(interval)
          setStatus('done')
          setTimeout(() => navigate(`/results/submission/${submissionId}`), 1000)
        } else if (data.status === 'failed') {
          clearInterval(interval)
          setStatus('failed')
        } else {
          setStatus(data.status as Status)
        }
      } catch (err) {
        console.error(err)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [submissionId])

  const handleSubmit = async () => {
    if (!answerFile) return
    setError(null)
    setStatus('uploading')

    try {
      const token = localStorage.getItem('ai-grader-token')
      const formData = new FormData()
      formData.append('assignment_id', String(assignmentId))
      formData.append('answer_file', answerFile)

      const response = await fetch('http://localhost:8000/upload/sheet', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Upload failed')
      }

      const data = await response.json()
      setSubmissionId(data.submission_id)
      setStatus('pending')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setStatus('idle')
    }
  }

  const isProcessing = ['pending', 'extracting', 'grading'].includes(status)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Submit Answer Sheet</h2>
        <p className="text-muted-foreground mt-1">Upload your answer sheet for AI grading</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Your Answer Sheet
          </CardTitle>
          <CardDescription>Upload your completed answer sheet (PDF or image)</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            onFileSelect={setAnswerFile}
            accept=".pdf,.png,.jpg,.jpeg"
          />
          {answerFile && (
            <div className="mt-3 flex items-center gap-2 text-sm text-success">
              <CheckCircle className="w-4 h-4" />
              {answerFile.name} selected
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                {status === 'idle' ? 'Ready to Submit?' : STATUS_MESSAGES[status]}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {status === 'idle' ? 'AI will grade your answers automatically' : 'Please wait...'}
              </p>
            </div>
            {!isProcessing && status !== 'done' && (
              <Button size="lg" onClick={handleSubmit} disabled={!answerFile} isLoading={status === 'uploading'}>
                Submit
              </Button>
            )}
          </div>

          {isProcessing && (
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <Spinner size="sm" />
              <span>{STATUS_MESSAGES[status]}</span>
            </div>
          )}

          {status === 'done' && (
            <div className="mt-4 flex items-center gap-2 text-sm text-success">
              <CheckCircle className="w-4 h-4" />
              Redirecting to results...
            </div>
          )}

          {status === 'failed' && (
            <div className="mt-4">
              <Button variant="outline" onClick={() => { setStatus('idle'); setSubmissionId(null) }}>
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}