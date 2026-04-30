import fitz
import re


class SchemeParser:

    def parse_questions(self, file_path):
        doc = fitz.open(file_path)
        full_text = ""

        for page_num in range(1, doc.page_count):
            page = doc.load_page(page_num)
            full_text += page.get_text()

        doc.close()

        candidates = re.findall(
            r'(?m)^(\d+)\s+([\s\S]*?)(?=^\d+\s|\Z)',
            full_text
        )

        structured_data = []

        for q_num, content in candidates:
            if re.search(r'\(a\)', content) and re.search(r'\[\d+\]', content):
                clean_content = re.sub(r'\.{5,}', '', content)
                clean_content = clean_content.replace('\n', ' ')
                clean_content = clean_content.strip()

                question_entry = {
                    "question_number": int(q_num),
                    "criteria_text": clean_content,
                }

                structured_data.append(question_entry)

        return structured_data