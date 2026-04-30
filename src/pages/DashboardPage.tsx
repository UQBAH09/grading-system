import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Empty } from '@/components/ui/Empty'
import { mockExams, type Exam } from '@/lib/data'
import { Plus, Upload, FileText, Calendar, Users, BookOpen } from 'lucide-react'

function ExamCard({ exam }: { exam: Exam }) {
  const navigate = useNavigate()

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
        </div>
        <CardTitle className="text-base mt-3">{exam.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Created {new Date(exam.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{exam.studentCount} students</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/upload/${exam.id}`)}
          >
            <Upload className="w-4 h-4" />
            Upload
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/results/${exam.id}`)}
          >
            <FileText className="w-4 h-4" />
            Results
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const [exams] = useState<Exam[]>(mockExams)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const navigate = useNavigate()

  const handleCreateExam = () => {
    // For now, navigate to upload with a new exam ID
    navigate('/upload/new')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Your Exams</h2>
          <p className="text-muted-foreground mt-1">
            Manage and grade your exams
          </p>
        </div>
        <Button onClick={handleCreateExam}>
          <Plus className="w-4 h-4" />
          Create New Exam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{exams.length}</div>
            <p className="text-primary-foreground/80 text-sm mt-1">Total Exams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-foreground">
              {exams.reduce((acc, e) => acc + e.studentCount, 0)}
            </div>
            <p className="text-muted-foreground text-sm mt-1">Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-success">98%</div>
            <p className="text-muted-foreground text-sm mt-1">Grading Accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Exams Grid */}
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <Card>
          <Empty
            title="No exams yet"
            description="Create your first exam to start grading answer sheets with AI"
            action={
              <Button onClick={handleCreateExam}>
                <Plus className="w-4 h-4" />
                Create New Exam
              </Button>
            }
          />
        </Card>
      )}
    </div>
  )
}
