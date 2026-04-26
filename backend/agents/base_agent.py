from abc import ABC, abstractmethod

class BaseAgent(ABC):
    def __init__(self, agent_id, status = "idle"):
        self.agent_id = agent_id
        self.status = status

    @abstractmethod
    async def run(self):
        pass

    async def on_complete(self):
        pass