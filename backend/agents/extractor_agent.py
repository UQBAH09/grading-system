import os
from agents.base_agent import BaseAgent
class ExtractorAgent(BaseAgent):
    def __init__(self, agent_id, file_path, submission_id, status="idle"):
        super().__init__(agent_id, status)
        self.file_path = file_path
        self.file_type = None
        self.submission_id = submission_id
        self.detect_file_type()

    def detect_file_type(self):
        ext = os.path.splitext(self.file_path)[1].lower()
        if ext == ".pdf":
            self.file_type = "pdf"
        else:
            self.file_type = "image"

    async def run(self):
        pass
    
    async def send_finish_signal(self):
        pass