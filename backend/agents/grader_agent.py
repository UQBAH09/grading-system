import uuid
import asyncio
import random
from agents.base_agent import BaseAgent
from services.db_service import DBService
from models.answer_part import AnswerPart
from models.question import Question
from models.grading_result import GradingResult

class GraderAgent(BaseAgent):
    def __init__(self, submission_id, submission_type, core):
        super().__init__(agent_id=str(uuid.uuid4()), status="idle")
        self.submission_id = submission_id
        self.submission_type = submission_type
        self.core = core
        self.db_service = DBService()

    async def run(self):
        self.status = "busy"
        try:
            parts = self.db_service.query(AnswerPart, {"submission_id": self.submission_id})

            if not parts:
                print(f"No answer parts found for submission {self.submission_id}")
                await self.core.on_failure(self.submission_id)
                return

            await self.grade_all_parts(parts)
            await self.send_finish_signal()

        except Exception as e:
            print(f"GraderAgent error: {e}")
            await self.core.on_failure(self.submission_id)
            self.status = "failed"

    async def grade_all_parts(self, parts):
        tasks = [self.grade_single_part(part) for part in parts]
        await asyncio.gather(*tasks)

    async def grade_single_part(self, part):
        questions = self.db_service.query(Question, {"question_id": part.question_id})
        if not questions:
            print(f"No question found for part {part.part_id}")
            return

        question = questions[0]

        # Simulate AI processing time
        await asyncio.sleep(1)

        result = self.mock_grade(part, question)

        grading = GradingResult(
            part_id=part.part_id,
            marks_awarded=result["marks_awarded"],
            comments=result["comments"],
            improvement=result["improvement"],
            agent_attempts=1
        )
        self.db_service.save(grading)
        print(f"Graded part {part.part_id} — {result['marks_awarded']}/{question.max_marks} marks")

    def mock_grade(self, part, question):
        max_marks = question.max_marks or 10
        
        # Give a realistic score based on answer length
        text_length = len(part.extracted_text.split())
        if text_length > 80:
            marks = round(max_marks * random.uniform(0.75, 0.95))
            comments = "Good answer with detailed explanation. Shows strong understanding of the topic."
            improvement = "Could include more specific examples to strengthen the argument further."
        elif text_length > 40:
            marks = round(max_marks * random.uniform(0.55, 0.75))
            comments = "Reasonable answer but lacks some depth. Key points are covered."
            improvement = "Expand on your points with more specific references and examples."
        else:
            marks = round(max_marks * random.uniform(0.30, 0.55))
            comments = "Basic answer that covers some points but needs more development."
            improvement = "Provide more detailed explanations and support your points with evidence."

        return {
            "marks_awarded": marks,
            "comments": comments,
            "improvement": improvement
        }

    async def send_finish_signal(self):
        self.status = "done"
        await self.core.on_grading_complete(self.submission_id)
        print(f"Grading complete for submission {self.submission_id}")

    async def on_complete(self):
        self.status = "idle"