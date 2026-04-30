// Mock data for the AI Grader application

export interface Exam {
  id: string
  title: string
  createdAt: string
  studentCount: number
}

export interface StudentResult {
  sheet_id: number
  student_name: string
  student_id: string
  total_marks: number
  max_marks: number
}

export interface QuestionBreakdown {
  question: string
  marks_awarded: number
  max_marks: number
  comments: string
  suggestions: string
  verified: boolean
}

export interface StudentDetail {
  sheet_id: number
  student_name: string
  student_id: string
  total_marks: number
  max_marks: number
  questions: QuestionBreakdown[]
}

export interface QuestionStats {
  question: string
  avg_marks: number
  max_marks: number
}

export interface StudentScore {
  student_name: string
  total_marks: number
}

// Mock exams
export const mockExams: Exam[] = [
  { id: '1', title: 'Midterm Exam - Mathematics', createdAt: '2024-03-15', studentCount: 35 },
  { id: '2', title: 'Final Exam - Physics', createdAt: '2024-03-10', studentCount: 28 },
  { id: '3', title: 'Quiz 1 - Chemistry', createdAt: '2024-03-05', studentCount: 42 },
]

// Mock results
export const mockResults: StudentResult[] = [
  { sheet_id: 1, student_name: 'Ali Hassan', student_id: 'S001', total_marks: 34, max_marks: 50 },
  { sheet_id: 2, student_name: 'Sara Khan', student_id: 'S002', total_marks: 42, max_marks: 50 },
  { sheet_id: 3, student_name: 'Ahmed Raza', student_id: 'S003', total_marks: 28, max_marks: 50 },
  { sheet_id: 4, student_name: 'Fatima Ali', student_id: 'S004', total_marks: 45, max_marks: 50 },
  { sheet_id: 5, student_name: 'Usman Shah', student_id: 'S005', total_marks: 18, max_marks: 50 },
  { sheet_id: 6, student_name: 'Zara Ahmed', student_id: 'S006', total_marks: 38, max_marks: 50 },
]

// Mock student detail
export const mockStudentDetail: StudentDetail = {
  sheet_id: 1,
  student_name: 'Ali Hassan',
  student_id: 'S001',
  total_marks: 34,
  max_marks: 50,
  questions: [
    { question: '1a', marks_awarded: 4, max_marks: 5, comments: 'Good understanding of the concept', suggestions: 'Include more examples in your explanation', verified: true },
    { question: '1b', marks_awarded: 3, max_marks: 4, comments: 'Correct approach but minor calculation error', suggestions: 'Double-check arithmetic operations', verified: true },
    { question: '2a', marks_awarded: 5, max_marks: 5, comments: 'Excellent answer', suggestions: 'None', verified: true },
    { question: '2b', marks_awarded: 2, max_marks: 5, comments: 'Partial understanding shown', suggestions: 'Review the fundamentals of this topic', verified: false },
    { question: '3a', marks_awarded: 6, max_marks: 8, comments: 'Good but incomplete derivation', suggestions: 'Show all steps clearly', verified: true },
    { question: '3b', marks_awarded: 4, max_marks: 6, comments: 'Correct method, presentation could improve', suggestions: 'Organize your work more clearly', verified: false },
    { question: '4', marks_awarded: 3, max_marks: 7, comments: 'Missing key points', suggestions: 'Study the related theorems thoroughly', verified: true },
    { question: '5', marks_awarded: 7, max_marks: 10, comments: 'Good analysis but conclusion needs work', suggestions: 'Strengthen your concluding statements', verified: true },
  ],
}

// Mock stats
export const mockQuestionStats: QuestionStats[] = [
  { question: '1a', avg_marks: 3.2, max_marks: 5 },
  { question: '1b', avg_marks: 2.7, max_marks: 4 },
  { question: '2a', avg_marks: 4.1, max_marks: 5 },
  { question: '2b', avg_marks: 2.3, max_marks: 5 },
  { question: '3a', avg_marks: 5.2, max_marks: 8 },
  { question: '3b', avg_marks: 3.8, max_marks: 6 },
  { question: '4', avg_marks: 4.2, max_marks: 7 },
  { question: '5', avg_marks: 6.5, max_marks: 10 },
]

export const mockStudentScores: StudentScore[] = [
  { student_name: 'Ali Hassan', total_marks: 34 },
  { student_name: 'Sara Khan', total_marks: 42 },
  { student_name: 'Ahmed Raza', total_marks: 28 },
  { student_name: 'Fatima Ali', total_marks: 45 },
  { student_name: 'Usman Shah', total_marks: 18 },
  { student_name: 'Zara Ahmed', total_marks: 38 },
]

// Helper function to get percentage color class
export function getPercentageColor(percentage: number): string {
  if (percentage >= 70) return 'text-success'
  if (percentage >= 40) return 'text-warning'
  return 'text-destructive'
}

export function getPercentageBgColor(percentage: number): string {
  if (percentage >= 70) return 'bg-success'
  if (percentage >= 40) return 'bg-warning'
  return 'bg-destructive'
}
