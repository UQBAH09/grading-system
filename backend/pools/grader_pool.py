from pools.agent_pool import AgentPool
from agents.grader_agent import GraderAgent

class GraderPool(AgentPool):
    def __init__(self, m_agents=3):
        super().__init__(m_agents)

    async def dispatch_grading(self, submission_id, submission_type, core):
        job = {
            "submission_id": submission_id,
            "submission_type": submission_type,
            "core": core
        }
        await self.dispatch(job)

    async def dispatch(self, job):
        agent = GraderAgent(
            submission_id=job["submission_id"],
            submission_type=job["submission_type"],
            core=job["core"]
        )
        self.active_agents.append(agent)
        try:
            await agent.run()
        finally:
            self.active_agents.remove(agent)