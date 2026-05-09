import fitz


class PDFExtractor:

    def extract(self, file_path):
        doc = fitz.open(file_path)
        full_text = ""

        for page_num in range(0, doc.page_count):
            page = doc.load_page(page_num)
            full_text += page.get_text()

        doc.close()
        return full_text