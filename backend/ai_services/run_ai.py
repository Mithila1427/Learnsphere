import sys
from backend.ai_services.ai_engine import store_pdf, ask_question

pdf_path = sys.argv[1]
question = sys.argv[2]

store_pdf(pdf_path)

answer = ask_question(question)

print(answer)
