import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FileUpload } from '@/components/ui/FileUpload'
import { Spinner } from '@/components/ui/Spinner'
import { Plus, Trash2, CheckCircle, FileText } from 'lucide-react'

interface StudentUpload {
  id: string
  name: string
  studentId: string
  file: File | null
}

export function UploadPage() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const [markingScheme, setMarkingScheme] = useState<File | null>(null)
  const [students, setStudents] = useState<StudentUpload[]>([
    { id: '1', name: '', studentId: '', file: null }
  ])
  const [isGrading, setIsGrading] = useState(false)

  const addStudent = () => {
    setStudents([
      ...students,
      { id: Date.now().toString(), name: '', studentId: '', file: null }
    ])
  }

  const removeStudent = (id: string) => {
    if (students.length > 1) {
      setStudents(students.filter(s => s.id !== id))
    }
  }

  const updateStudent = (id: string, field: keyof StudentUpload, value: string | File | null) => {
    setStudents(students.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  const handleGradeAll = async () => {
    setIsGrading(true)
    // Simulate grading process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsGrading(false)
    navigate(`/results/${examId}`)
  }

  const isReadyToGrade = markingScheme && students.some(s => s.name && s.studentId && s.file)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Marking Scheme Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Marking Scheme
          </CardTitle>
          <CardDescription>
            Upload the answer key or marking scheme for this exam
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            onFileSelect={setMarkingScheme}
            accept=".pdf,.png,.jpg,.jpeg"
          />
          {markingScheme && (
            <div className="mt-4 flex items-center gap-2 text-sm text-success">
              <CheckCircle className="w-4 h-4" />
              Marking scheme uploaded successfully
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer Sheets Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Answer Sheets</CardTitle>
              <CardDescription>
                Add student information and upload their answer sheets
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addStudent}>
              <Plus className="w-4 h-4" />
              Add More
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {students.map((student, index) => (
              <div key={student.id} className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-foreground">
                    Student {index + 1}
                  </span>
                  {students.length > 1 && (
                    <button
                      onClick={() => removeStudent(student.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Student Name"
                    placeholder="e.g., Ali Hassan"
                    value={student.name}
                    onChange={(e) => updateStudent(student.id, 'name', e.target.value)}
                  />
                  <Input
                    label="Student ID"
                    placeholder="e.g., S001"
                    value={student.studentId}
                    onChange={(e) => updateStudent(student.id, 'studentId', e.target.value)}
                  />
                </div>
                
                <FileUpload
                  onFileSelect={(file) => updateStudent(student.id, 'file', file)}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 rounded-xl bg-secondary/30 border border-secondary">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {students.filter(s => s.file).length} of {students.length} sheets uploaded
              </span>
              <span className="font-medium text-foreground">
                Ready to grade: {isReadyToGrade ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Button */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Ready to Grade?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI will analyze and grade all uploaded answer sheets
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleGradeAll}
              disabled={!isReadyToGrade || isGrading}
              isLoading={isGrading}
            >
              {isGrading ? 'Grading...' : 'Grade All'}
            </Button>
          </div>
          
          {isGrading && (
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <Spinner size="sm" />
              Processing answer sheets... This may take a few moments.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
