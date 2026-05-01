import re


class SchemeParser:

    def parse_questions(self, text):
        candidates = re.findall(
            r'(?m)^(\d+)\s+([\s\S]*?)(?=^\d+\s|\Z)',
            text
        )

        structured_data = []

        for q_num, content in candidates:
            if re.search(r'\[\d+\]', content):
                clean_content = re.sub(r'\.{5,}', '', content)
                clean_content = clean_content.replace('\n', ' ')
                clean_content = clean_content.strip()

                if clean_content:
                    question_entry = {
                        "question_number": int(q_num),
                        "criteria_text": clean_content,
                    }
                    structured_data.append(question_entry)

        return structured_data