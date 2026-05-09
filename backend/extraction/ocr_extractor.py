import pytesseract
from PIL import Image


class OCRExtractor:

    def extract(self, file_path):
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text