import re

class SchemeParser:

    def parse_questions(self, text):
        structured_data = []
        seen = {}  # track (question_number, part) to avoid duplicates

        # Split by top-level question numbers at start of line
        question_blocks = re.split(r'(?m)^\s*(\d+)\s*\n', text)

        i = 1
        while i < len(question_blocks) - 1:
            q_num = int(question_blocks[i])
            q_content = question_blocks[i + 1]

            # Skip page numbers and syllabus numbers (12, 2058 etc)
            if q_num > 10:
                i += 2
                continue

            # Split by parts (a), (b), (c) etc
            part_blocks = re.split(r'\(([a-z])\)', q_content)

            if len(part_blocks) == 1:
                clean = part_blocks[0].strip()
                if clean and len(clean) > 30:
                    key = (q_num, None)
                    # Keep longest version
                    if key not in seen or len(clean) > len(seen[key]["criteria_text"]):
                        marks_match = re.search(r'\[(\d+)\]', clean)
                        max_marks = int(marks_match.group(1)) if marks_match else 10
                        seen[key] = {
                            "question_number": q_num,
                            "part": None,
                            "max_marks": max_marks,
                            "criteria_text": clean
                        }
            else:
                for j in range(1, len(part_blocks) - 1, 2):
                    part_label = part_blocks[j]
                    part_text = part_blocks[j + 1].strip()

                    # Skip single letter parts that are not real parts

                    # Skip if part label is longer than 1 character or not a-f
                    if len(part_label) != 1 or part_label not in 'abcdef':
                        continue
                    
                    # e.g. "Part (a) tests AO1"
                    if len(part_text) < 30:
                        continue

                    # Skip parts that are clearly not criteria
                    if part_text.startswith('tests AO'):
                        continue

                    key = (q_num, part_label)
                    if key not in seen or len(part_text) > len(seen[key]["criteria_text"]):
                        marks_match = re.search(r'\[(\d+)\]', part_text)
                        max_marks = int(marks_match.group(1)) if marks_match else 10
                        seen[key] = {
                            "question_number": q_num,
                            "part": part_label,
                            "max_marks": max_marks,
                            "criteria_text": part_text
                        }

            i += 2

        return list(seen.values())