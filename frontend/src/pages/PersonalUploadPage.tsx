import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/ui/FileUpload'
import { Spinner } from '@/components/ui/Spinner'
import { CheckCircle, FileText, BookOpen, AlertCircle } from 'lucide-react'

type Status = 'idle' | 'uploading' | 'pending' | 'extracting' | 'grading' | 'done' | 'failed'

const STATUS_MESSAGES: Record<Status, string> = {
  idle: '',
  uploading: 'Uploading files...',
  pending: 'Files uploaded. Waiting in queue...',
  extracting: 'Extracting text from your answer sheet...',
  grading: 'AI is grading your answers...',
  done: 'Grading complete!',
  failed: 'Something went wrong. Please try again.',
}

export function PersonalUploadPage() {
  const navigate = useNavigate()
  const [answerFile, setAnswerFile] = useState<File | null>(null)
  const [schemeFile, setSchemeFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isReadyToSubmit = answerFile && schemeFile && status === 'idle'

  // Poll status every 3 seconds after submission
  useEffect(() => {
    if (!submissionId || status === 'done' || status === 'failed' || status === 'idle' || status === 'uploading') return

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('ai-grader-token')
        const response = await fetch(`http://localhost:8000/personal/status/${submissionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) return

        const data = await response.json()
        setStatus(data.status as Status)

        if (data.status === 'done') {
          clearInterval(interval)
          setTimeout(() => navigate(`/personal/results/${submissionId}`), 1000)
        }

        if (data.status === 'failed') {
          clearInterval(interval)
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [submissionId, status, navigate])

  const handleSubmit = async () => {
    if (!answerFile || !schemeFile) return

    setError(null)
    setStatus('uploading')

    try {
      const token = localStorage.getItem('ai-grader-token')

      const formData = new FormData()
      formData.append('answer_file', answerFile)
      formData.append('scheme_file', schemeFile)

      const response = await fetch('http://localhost:8000/personal/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Upload failed')
      }

      const data = await response.json()
      setSubmissionId(data.submission_id)
      setStatus('pending')

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      setStatus('idle')
    }
  }

  const isProcessing = ['pending', 'extracting', 'grading'].includes(status)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Personal Grading</h2>
        <p className="text-muted-foreground mt-1">
          Upload your answer sheet and marking scheme to get AI-powered feedback
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Answer Sheet Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Your Answer Sheet
          </CardTitle>
          <CardDescription>
            Upload your completed answer sheet (PDF or image)
          </CardDescription>
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

      {/* Marking Scheme Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Marking Scheme
          </CardTitle>
          <CardDescription>
            Upload the marking scheme or answer key (PDF or image)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            onFileSelect={setSchemeFile}
            accept=".pdf,.png,.jpg,.jpeg"
          />
          {schemeFile && (
            <div className="mt-3 flex items-center gap-2 text-sm text-success">
              <CheckCircle className="w-4 h-4" />
              {schemeFile.name} selected
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit + Status */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                {status === 'idle' ? 'Ready to Submit?' : STATUS_MESSAGES[status]}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {status === 'idle'
                  ? 'AI will extract and grade your answers automatically'
                  : 'Please wait while we process your submission'}
              </p>
            </div>
            {!isProcessing && status !== 'done' && (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!isReadyToSubmit}
                isLoading={status === 'uploading'}
              >
                Submit
              </Button>
            )}
          </div>

          {/* Progress indicator */}
          {isProcessing && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Spinner size="sm" />
                <span>{STATUS_MESSAGES[status]}</span>
              </div>
              <div className="flex gap-2">
                {['pending', 'extracting', 'grading'].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      ['pending', 'extracting', 'grading'].indexOf(status) >=
                      ['pending', 'extracting', 'grading'].indexOf(s)
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
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
              <Button variant="outline" onClick={() => setStatus('idle')}>
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}