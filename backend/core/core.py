import asyncio
from pools.extractor_pool import ExtractorPool
from pools.grader_pool import GraderPool
from services.db_service import DBService
from models.submission import Submission

class Core:
    def __init__(self):
        self.extractor_pool = ExtractorPool(n_agents=3)
        self.grader_pool = GraderPool(m_agents=3)
        self.db_service = DBService()

    async def receive_upload(self, answer_path, scheme_path, submission_id, scheme_id, submission_type="personal"):
        await self.update_status(submission_id, "extracting")
        asyncio.create_task(
            self.extractor_pool.dispatch_extraction(
                answer_path, scheme_path, submission_id, scheme_id, submission_type, self
            )
        )

    async def on_extraction_complete(self, submission_id, submission_type="personal"):
        await self.update_status(submission_id, "grading")
        asyncio.create_task(
            self.grader_pool.dispatch_grading(submission_id, submission_type, self)
        )

    async def on_failure(self, submission_id):
        await self.update_status(submission_id, "failed")

    async def update_status(self, submission_id, status):
        session = self.db_service.get_session()
        try:
            submission = session.query(Submission).filter(
                Submission.submission_id == submission_id
            ).first()
            if submission:
                submission.status = status
                session.commit()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    async def notify_user(self, user_id, status):
        pass