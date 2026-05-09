import asyncio
from pools.agent_pool import AgentPool
from agents.extractor_agent import ExtractorAgent

class ExtractorPool(AgentPool):
    def __init__(self, n_agents=3):
        super().__init__(n_agents)

    async def dispatch_extraction(self, answer_path, scheme_path, submission_id, submission_type, core):
        job = {
            "answer_path": answer_path,
            "scheme_path": scheme_path,
            "submission_id": submission_id,
            "submission_type": submission_type,
            "core": core
        }
        await self.dispatch(job)

    async def dispatch(self, job):
        agent = ExtractorAgent(
            file_path=job["answer_path"],
            scheme_path=job["scheme_path"],
            submission_id=job["submission_id"],
            submission_type=job["submission_type"],
            core=job["core"]
        )
        self.active_agents.append(agent)
        try:
            await agent.run()
        finally:
            self.active_agents.remove(agent)