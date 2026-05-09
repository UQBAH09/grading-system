import re

class QuestionParser:

    def parse_parts(self, text):
        structured_data = []

        # Split by "Question N"
        question_blocks = re.split(r'Question\s+(\d+)', text)

        i = 1
        while i < len(question_blocks) - 1:
            q_num = int(question_blocks[i])
            q_content = question_blocks[i + 1]

            # Split by parts (a), (b), (c) etc
            part_blocks = re.split(r'\(([a-z])\)', q_content)

            if len(part_blocks) == 1:
                # No parts — whole content is the answer
                clean = part_blocks[0].strip()
                if clean:
                    structured_data.append({
                        "question_number": q_num,
                        "part": None,
                        "full_text": clean
                    })
            else:
                # First element before any part label — skip it
                for j in range(1, len(part_blocks) - 1, 2):
                    part_label = part_blocks[j]
                    part_text = part_blocks[j + 1].strip()
                    if part_text:
                        structured_data.append({
                            "question_number": q_num,
                            "part": part_label,
                            "full_text": part_text
                        })

            i += 2

        return structured_data