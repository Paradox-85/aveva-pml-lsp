"""
combine_pdfs_to_md.py

Скрипт читает три PDF-файла и объединяет извлечённый текст
в один Markdown-файл с тремя секциями по именам исходных PDF.

Требования: pip install pypdf
"""

import re
import sys
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    print("Установите pypdf: pip install pypdf")
    sys.exit(1)

DOCS_DIR = Path(__file__).parent

PDF_FILES = [
    "TM-1401 AVEVA Plant (12 Series) PML Macros and Functions Rev 2.0.pdf",
    "TM-1401 AVEVA Plant (12 Series) Programmable Macro Language (Basic) Rev 3.0.pdf",
    "TM-1402 AVEVA Plant (12 Series) PML Form Design Rev 1.0.pdf",
]

OUTPUT_MD = "combined_pml_reference.md"


def clean_text(text: str) -> str:
    """Убираем лишние переносы строк и пустые строки, но сохраняем структуру."""
    # Заменяем переносы внутри слов (дефисные) — убираем дефис-перенос
    text = re.sub(r'-\n\s*', '', text)
    # Заменяем множественные переносы строк на один
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Убираем пробелы в начале/конце каждой строки
    lines = [line.rstrip() for line in text.splitlines()]
    text = '\n'.join(lines)
    return text.strip()


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Извлекает текст из PDF-файла."""
    reader = PdfReader(str(pdf_path))
    pages_text = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            pages_text.append(page_text)
    return '\n\n'.join(pages_text)


def generate_section_title(pdf_filename: str) -> str:
    """Формирует заголовок H2 из имени PDF-файла."""
    # Убираем расширение .pdf
    name = Path(pdf_filename).stem
    return f"## {name}"


def main():
    sections = []

    for pdf_name in PDF_FILES:
        pdf_path = DOCS_DIR / pdf_name
        if not pdf_path.exists():
            print(f"[!] Файл не найден: {pdf_path}")
            continue

        print(f"[→] Обрабатываю: {pdf_name}")
        raw_text = extract_text_from_pdf(pdf_path)
        cleaned = clean_text(raw_text)

        section = f"{generate_section_title(pdf_name)}\n\n{cleaned}"
        sections.append(section)

        # Показываем объём
        page_count = len(PdfReader(str(pdf_path)).pages)
        char_count = len(cleaned)
        print(f"    Страниц: {page_count}, Символов: {char_count}")

    if not sections:
        print("[!] Нет секций для записи.")
        sys.exit(1)

    # Формируем итоговый Markdown
    header = "# AVEVA Plant (12 Series) — PML Справочник\n\n"
    header += "> Скомпилировано из следующих источников:\n"
    for pdf_name in PDF_FILES:
        stem = Path(pdf_name).stem
        header += f"- `{pdf_name}`\n"
    header += "\n---\n"

    output = header + "\n\n---\n\n".join(sections) + "\n"

    output_path = DOCS_DIR / OUTPUT_MD
    output_path.write_text(output, encoding="utf-8")

    total_chars = sum(len(s) for s in sections)
    print(f"\n[✓] Готово: {output_path}")
    print(f"    Строк: {output.count(chr(10))}")
    print(f"    Символов: {total_chars}")


if __name__ == "__main__":
    main()
