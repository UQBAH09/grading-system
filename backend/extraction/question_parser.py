import re


class QuestionParser:

    def parse_parts(self, text):
        candidates = re.findall(
            r'Question\s+(\d+)([\s\S]*?)(?=Question\s+\d+|\Z)',
            text
        )

        structured_data = []

        for q_num, content in candidates:
            clean_content = re.sub(r'\.{5,}', '', content)
            clean_content = clean_content.replace('\n', ' ')
            clean_content = clean_content.strip()

            if clean_content:
                question_entry = {
                    "question_number": int(q_num),
                    "full_text": clean_content,
                }
                structured_data.append(question_entry)

        return structured_data