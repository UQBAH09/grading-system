from agents.base_agent import BaseAgent

class GraderAgent(BaseAgent):
    def __init__(self, agent_id, sheet_id, status="idle"):
        super().__init__(agent_id, status)
        self.sheet_id = sheet_id
        self.parts = []

    async def run(self):
        pass

    async def grade_all_parts(self):
        pass

    async def call_ai_api(self, part, criteria):
        pass

    async def send_finish_signal(self):
        pass