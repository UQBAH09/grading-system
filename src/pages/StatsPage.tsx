import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { mockQuestionStats, mockStudentScores } from '@/lib/data'
import { ArrowLeft, Download } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'

export function StatsPage() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const { theme } = useTheme()

  // Theme-aware chart colors
  const chartColors = {
    primary: theme === 'dark' ? '#3B7AB8' : '#2C5F8A',
    secondary: theme === 'dark' ? '#5C9BD1' : '#90CAF9',
    grid: theme === 'dark' ? '#334155' : '#E2E8F0',
    text: theme === 'dark' ? '#94A3B8' : '#64748B',
    tooltipBg: theme === 'dark' ? '#1E293B' : '#FFFFFF',
    tooltipBorder: theme === 'dark' ? '#334155' : '#E2E8F0',
  }

  // Transform data for charts
  const questionData = mockQuestionStats.map(q => ({
    name: `Q${q.question}`,
    'Average Marks': q.avg_marks,
    'Max Marks': q.max_marks,
  }))

  const studentData = mockStudentScores.map(s => ({
    name: s.student_name.split(' ')[0], // First name only for chart
    'Total Marks': s.total_marks,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Statistics</h2>
          <p className="text-muted-foreground mt-1">
            Midterm Exam - Mathematics
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Average Marks Per Question</CardTitle>
            <CardDescription>
              Comparison of average marks achieved vs maximum marks per question
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={questionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: chartColors.text, fontSize: 12 }}
                    axisLine={{ stroke: chartColors.grid }}
                  />
                  <YAxis 
                    tick={{ fill: chartColors.text, fontSize: 12 }}
                    axisLine={{ stroke: chartColors.grid }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      color: theme === 'dark' ? '#E2E8F0' : '#1E293B',
                    }}
                    labelStyle={{
                      color: theme === 'dark' ? '#E2E8F0' : '#1E293B',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      color: chartColors.text,
                    }}
                  />
                  <Bar 
                    dataKey="Average Marks" 
                    fill={chartColors.primary}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="Max Marks" 
                    fill={chartColors.secondary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Student Score Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Student Score Comparison</CardTitle>
            <CardDescription>
              Total marks achieved by each student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: chartColors.text, fontSize: 12 }}
                    axisLine={{ stroke: chartColors.grid }}
                  />
                  <YAxis 
                    tick={{ fill: chartColors.text, fontSize: 12 }}
                    axisLine={{ stroke: chartColors.grid }}
                    domain={[0, 50]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      color: theme === 'dark' ? '#E2E8F0' : '#1E293B',
                    }}
                    labelStyle={{
                      color: theme === 'dark' ? '#E2E8F0' : '#1E293B',
                    }}
                  />
                  <Bar 
                    dataKey="Total Marks" 
                    fill={chartColors.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Question Difficulty Trend</CardTitle>
          <CardDescription>
            Shows how average performance varies across questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={questionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: chartColors.text, fontSize: 12 }}
                  axisLine={{ stroke: chartColors.grid }}
                />
                <YAxis 
                  tick={{ fill: chartColors.text, fontSize: 12 }}
                  axisLine={{ stroke: chartColors.grid }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: theme === 'dark' ? '#E2E8F0' : '#1E293B',
                  }}
                  labelStyle={{
                    color: theme === 'dark' ? '#E2E8F0' : '#1E293B',
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    color: chartColors.text,
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Average Marks" 
                  stroke={chartColors.primary}
                  strokeWidth={2}
                  dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Max Marks" 
                  stroke={chartColors.secondary}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: chartColors.secondary, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {(mockQuestionStats.reduce((acc, q) => acc + q.avg_marks, 0) / mockQuestionStats.length).toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Avg Marks per Question</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">Q2a</div>
            <p className="text-sm text-muted-foreground">Best Performed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">Q2b</div>
            <p className="text-sm text-muted-foreground">Needs Attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">68%</div>
            <p className="text-sm text-muted-foreground">Class Average</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
