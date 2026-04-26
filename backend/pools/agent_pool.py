from abc import ABC, abstractmethod
import asyncio

class AgentPool(ABC):
    def __init__(self, pool_size = 3):
        self.pool_size = pool_size
        self.job_queue = asyncio.Queue()
        self.active_agents = []
    
    @abstractmethod
    def dispatch(self, job):
        pass