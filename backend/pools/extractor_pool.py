from pools.agent_pool import AgentPool

class ExtractorPool(AgentPool):
    def __init__(self, pool_size = 3):
        super().__init__(pool_size)
    
    async def dispatch_extraction(self, file_path, submission_id):
        await self.job_queue.put({"file_path": file_path, "submission_id": submission_id})

    async def dispatch(self, job):
        pass

    async def worker(self):
        pass