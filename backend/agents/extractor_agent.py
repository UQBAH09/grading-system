import os
import uuid
from agents.base_agent import BaseAgent
from extraction.pdf_extractor import PDFExtractor
from extraction.ocr_extractor import OCRExtractor
from extraction.question_parser import QuestionParser
from extraction.scheme_parser import SchemeParser
from services.db_service import DBService
from models.personal_answer_part import PersonalAnswerPart
from models.personal_scheme_question import PersonalSchemeQuestion
from models.answer_part import AnswerPart
from models.scheme_question import SchemeQuestion

class ExtractorAgent(BaseAgent):
    def __init__(self, file_path, scheme_path, submission_id, submission_type, core):
        super().__init__(agent_id=str(uuid.uuid4()), status="idle")
        self.file_path = file_path
        self.scheme_path = scheme_path
        self.submission_id = submission_id
        self.submission_type = submission_type
        self.core = core
        self.file_type = self.detect_file_type(file_path)
        self.db_service = DBService()

    def detect_file_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        return "pdf" if ext == ".pdf" else "image"

    async def run(self):
        self.status = "busy"
        try:
            # Select extraction strategy based on file type
            if self.file_type == "pdf":
                extractor = PDFExtractor()
            else:
                extractor = OCRExtractor()

            # Extract text from answer sheet
            answer_text = extractor.extract(self.file_path)

            # Extract text from scheme file
            scheme_type = self.detect_file_type(self.scheme_path)
            if scheme_type == "pdf":
                scheme_extractor = PDFExtractor()
            else:
                scheme_extractor = OCRExtractor()
            scheme_text = scheme_extractor.extract(self.scheme_path)

            # Parse answer parts and scheme questions
            question_parser = QuestionParser()
            scheme_parser = SchemeParser()

            answer_parts = question_parser.parse_parts(answer_text)
            scheme_questions = scheme_parser.parse_questions(scheme_text)

            # Save parsed data to DB
            if self.submission_type == "personal":
                self._save_personal_parts(answer_parts, scheme_questions)
            else:
                self._save_sheet_parts(answer_parts)

            await self.send_finish_signal()

        except Exception as e:
            print(f"ExtractorAgent error: {e}")
            await self.core.on_failure(self.submission_id, self.submission_type)
            self.status = "failed"

    def _save_personal_parts(self, answer_parts, scheme_questions):
        # Save answer parts
        for part in answer_parts:
            answer_part = PersonalAnswerPart(
                submission_id=self.submission_id,
                question_number=part["question_number"],
                part=part.get("part"),
                extracted_text=part["full_text"]
            )
            self.db_service.save(answer_part)

        # Save scheme questions
        for question in scheme_questions:
            scheme_q = PersonalSchemeQuestion(
                submission_id=self.submission_id,
                question_number=question["question_number"],
                part=question.get("part"),
                max_marks=question.get("max_marks", 10),
                criteria_text=question["criteria_text"]
            )
            self.db_service.save(scheme_q)

    def _save_sheet_parts(self, answer_parts):
        # For teacher/student path
        for part in answer_parts:
            answer_part = AnswerPart(
                sheet_id=self.submission_id,
                question_number=part["question_number"],
                part=part.get("part"),
                extracted_text=part["full_text"]
            )
            self.db_service.save(answer_part)

    async def send_finish_signal(self):
        self.status = "done"
        await self.core.on_extraction_complete(self.submission_id, self.submission_type)

    async def on_complete(self):
        self.status = "idle"