from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, grade, personal, results, upload

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router)
app.include_router(grade.router)
app.include_router(personal.router)
app.include_router(results.router)
app.include_router(upload.router)

@app.get("/")
def root():
    return {"message": "Server is running"}