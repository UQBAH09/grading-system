from pools.agent_pool import AgentPool

class GraderPool(AgentPool):
    def __init__(self, m_agents=3):
        super().__init__(m_agents)

    async def dispatch_grading(self, submission_id, submission_type, core):
        # Will be implemented after extraction testing
        pass

    async def dispatch(self, job):
        pass