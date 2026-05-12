import uuid
import asyncio
import os
import json
from dotenv import load_dotenv
from groq import Groq
from agents.base_agent import BaseAgent
from services.db_service import DBService
from models.answer_part import AnswerPart
from models.question import Question
from models.grading_result import GradingResult

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path)

class GraderAgent(BaseAgent):
    def __init__(self, submission_id, submission_type, core):
        super().__init__(agent_id=str(uuid.uuid4()), status="idle")
        self.submission_id = submission_id
        self.submission_type = submission_type
        self.core = core
        self.db_service = DBService()
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.max_retries = 3

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
        result = await self.call_ai_api(part, question)
        if not result:
            return

        grading = GradingResult(
            part_id=part.part_id,
            marks_awarded=result["marks_awarded"],
            comments=result["comments"],
            improvement=result["improvement"],
            agent_attempts=result["attempts"]
        )
        self.db_service.save(grading)
        print(f"Graded part {part.part_id} — {result['marks_awarded']}/{question.max_marks} marks")

    async def call_ai_api(self, part, question):
        attempts = 0
        while attempts < self.max_retries:
            attempts += 1
            try:
                prompt = f"""You are an experienced examiner. Grade the following student answer.

                Question: {question.label}
                Marking Criteria: {question.criteria_text}
                Maximum Marks: {question.max_marks}

                Student Answer:
                {part.extracted_text}

                Respond ONLY with a valid JSON object in this exact format with no extra text:
                {{
                    "marks_awarded": <integer between 0 and {question.max_marks}>,
                    "comments": "<specific feedback on the answer>",
                    "improvement": "<specific suggestions for improvement>"
                }}"""

                response = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        max_tokens=500,
                        messages=[{"role": "user", "content": prompt}]
                    )
                )

                response_text = response.choices[0].message.content.strip()

                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0].strip()

                data = json.loads(response_text)
                marks = int(data["marks_awarded"])
                marks = max(0, min(marks, question.max_marks))

                return {
                    "marks_awarded": marks,
                    "comments": str(data["comments"]),
                    "improvement": str(data["improvement"]),
                    "attempts": attempts
                }

            except Exception as e:
                print(f"AI API attempt {attempts} failed: {e}")
                if attempts < self.max_retries:
                    await asyncio.sleep(2)
                else:
                    print(f"Max retries reached for part {part.part_id}")
                    return None

    async def send_finish_signal(self):
        self.status = "done"
        await self.core.on_grading_complete(self.submission_id)
        print(f"Grading complete for submission {self.submission_id}")

    async def on_complete(self):
        self.status = "idle"