import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from pdf_extractor import PDFExtractor
from question_parser import QuestionParser
from scheme_parser import SchemeParser

BASE = os.path.dirname(__file__)

# Test student answer sheet
print("=" * 50)
print("TESTING STUDENT ANSWER SHEET")
print("=" * 50)

extractor = PDFExtractor()
parser = QuestionParser()

text = extractor.extract(os.path.join(BASE, "student1_sara_ahmed.pdf"))
questions = parser.parse_parts(text)

for q in questions:
    print(f"Question {q['question_number']}:")
    print(q['full_text'][:200])
    print()

# Test marking scheme
print("=" * 50)
print("TESTING MARKING SCHEME")
print("=" * 50)

scheme = SchemeParser()
criteria = scheme.parse_questions(os.path.join(BASE, "2058_s15_ms_12.pdf"))

for c in criteria:
    print(f"Question {c['question_number']}:")
    print(c['criteria_text'][:200])
    print()