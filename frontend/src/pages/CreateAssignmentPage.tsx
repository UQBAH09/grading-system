import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FileUpload } from '@/components/ui/FileUpload'
import { CheckCircle, AlertCircle, BookOpen, FileText } from 'lucide-react'

export function CreateAssignmentPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [schemeFile, setSchemeFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'create' | 'scheme'>('create')
  const [assignmentId, setAssignmentId] = useState<number | null>(null)

  const handleCreateAssignment = async () => {
    if (!title.trim()) {
      setError('Please enter an assignment title')
      return
    }
    setError(null)
    setIsLoading(true)

    try {
      const token = localStorage.getItem('ai-grader-token')
      const formData = new FormData()
      formData.append('title', title)

      const response = await fetch('http://localhost:8000/upload/assignment', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to create assignment')
      }

      const data = await response.json()
      setAssignmentId(data.assignment_id)
      setStep('scheme')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadScheme = async () => {
    if (!schemeFile || !assignmentId) return
    setError(null)
    setIsLoading(true)

    try {
      const token = localStorage.getItem('ai-grader-token')
      const formData = new FormData()
      formData.append('assignment_id', String(assignmentId))
      formData.append('scheme_file', schemeFile)

      const response = await fetch('http://localhost:8000/upload/scheme', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to upload scheme')
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload scheme')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Create Assignment</h2>
        <p className="text-muted-foreground mt-1">Set up a new assignment for your students</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1 — Create Assignment */}
      <Card className={step === 'scheme' ? 'opacity-60' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Step 1 — Assignment Details
            {step === 'scheme' && <CheckCircle className="w-5 h-5 text-success ml-auto" />}
          </CardTitle>
          <CardDescription>Give your assignment a title</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            label="Assignment Title"
            placeholder="e.g. Islamiyat Paper 1 - May 2015"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={step === 'scheme'}
          />
          {step === 'create' && (
            <Button onClick={handleCreateAssignment} isLoading={isLoading}>
              Create Assignment
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Step 2 — Upload Scheme */}
      {step === 'scheme' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Step 2 — Upload Marking Scheme
            </CardTitle>
            <CardDescription>Upload the marking scheme PDF for this assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload
              onFileSelect={setSchemeFile}
              accept=".pdf,.png,.jpg,.jpeg"
            />
            {schemeFile && (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle className="w-4 h-4" />
                {schemeFile.name} selected
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleUploadScheme}
                disabled={!schemeFile}
                isLoading={isLoading}
              >
                Upload & Finish
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}