from pools.extractor_pool import ExtractorPool
from pools.grader_pool import GraderPool

class Core:
    def __init__(self, num_extractor_agent, num_grader_agent):
        self.extractor_pool = ExtractorPool(num_extractor_agent)
        self.grader_pool = GraderPool(num_grader_agent)

    async def receive_upload(self, file_path, submission_id):
        pass

    async def on_extraction_complete(self, submission_id):
        pass

    async def on_grading_complete(self, submission_id):
        pass

    async def update_status(self, submission_id, status):
        pass

    async def notify_user(self, user_id, status):
        pass