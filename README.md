# AI-Powered Automated Answer Sheet Grading System

A web-based system that automates grading of student answer sheets using AI. Supports PDF and image uploads, extracts text using PyMuPDF and Tesseract OCR, and grades answers against marking schemes using the Groq LLM API.

## Tech Stack
- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend:** React.js, TypeScript, Recharts
- **AI:** Groq API (llama-3.3-70b-versatile)
- **OCR:** Tesseract + PyMuPDF

## User Roles
- **Personal** — Upload answer sheet + marking scheme, get instant AI feedback
- **Teacher** — Create assignments, upload marking schemes, view class statistics
- **Student** — Browse assignments, submit answer sheets, view results

## Setup

### Prerequisites
- Python 3.13+, Node.js 20+, PostgreSQL 16, Tesseract OCR, uv

### Backend
```bash
cd backend
uv sync
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the project root:
DATABASE_URL=postgresql://grading_user:password@localhost:5432/grading_db
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret

## Team
- **Uqbah** — Backend API, Agent System, Core Pipeline
- **Saad** — Database Models, Extraction Pipeline
- **Ilsa** — Frontend, UI/UX