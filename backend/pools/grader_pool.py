from pools.agent_pool import AgentPool

class GraderPool(AgentPool):
    def __init__(self, pool_size = 3):
        super().__init__(pool_size)
    
    async def dispatch_grading(self, sheet_id):
        await self.job_queue.put({"sheet_id": sheet_id})

    async def dispatch(self, job):
        pass

    async def worker(self):
        pass