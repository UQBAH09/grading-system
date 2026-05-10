import os
import uuid
from agents.base_agent import BaseAgent
from extraction.pdf_extractor import PDFExtractor
from extraction.ocr_extractor import OCRExtractor
from extraction.question_parser import QuestionParser
from extraction.scheme_parser import SchemeParser
from services.db_service import DBService
from models.answer_part import AnswerPart
from models.question import Question

class ExtractorAgent(BaseAgent):
    def __init__(self, file_path, scheme_path, submission_id, scheme_id, submission_type, core):
        super().__init__(agent_id=str(uuid.uuid4()), status="idle")
        self.file_path = file_path
        self.scheme_path = scheme_path
        self.submission_id = submission_id
        self.scheme_id = scheme_id
        self.submission_type = submission_type
        self.core = core
        self.file_type = self._detect_file_type(file_path)
        self.db_service = DBService()

    def _detect_file_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        return "pdf" if ext == ".pdf" else "image"

    async def run(self):
        self.status = "busy"
        try:
            # Extract answer sheet text
            extractor = PDFExtractor() if self.file_type == "pdf" else OCRExtractor()
            answer_text = extractor.extract(self.file_path)

            # Extract scheme text
            scheme_type = self._detect_file_type(self.scheme_path)
            scheme_extractor = PDFExtractor() if scheme_type == "pdf" else OCRExtractor()
            scheme_text = scheme_extractor.extract(self.scheme_path)

            # Parse
            answer_parts = QuestionParser().parse_parts(answer_text)
            scheme_questions = SchemeParser().parse_questions(scheme_text)

            # Save scheme questions as Question rows
            self._save_questions(scheme_questions)

            # Save answer parts
            self._save_answer_parts(answer_parts)

            await self.send_finish_signal()

        except Exception as e:
            print(f"ExtractorAgent error: {e}")
            await self.core.on_failure(self.submission_id)
            self.status = "failed"

    def _save_questions(self, scheme_questions):
        for q in scheme_questions:
            label = f"{q['question_number']}{q['part'] or ''}"
            question = Question(
                scheme_id=self.scheme_id,
                parent_id=None,
                label=label,
                max_marks=q.get("max_marks", 10),
                criteria_text=q.get("criteria_text", "")
            )
            self.db_service.save(question)

    def _save_answer_parts(self, answer_parts):
        # Match each answer part to its question by label
        for part in answer_parts:
            label = f"{part['question_number']}{part.get('part') or ''}"

            # Find matching question
            session = self.db_service.get_session()
            try:
                question = session.query(Question).filter(
                    Question.scheme_id == self.scheme_id,
                    Question.label == label
                ).first()
            finally:
                session.close()

            if question:
                answer_part = AnswerPart(
                    submission_id=self.submission_id,
                    question_id=question.question_id,
                    extracted_text=part["full_text"]
                )
                self.db_service.save(answer_part)

    async def send_finish_signal(self):
        self.status = "done"
        await self.core.on_extraction_complete(self.submission_id, self.submission_type)

    async def on_complete(self):
        self.status = "idle"