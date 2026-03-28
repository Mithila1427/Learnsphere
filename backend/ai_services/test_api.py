import requests

url = "http://127.0.0.1:5001/ask"

# take question from user
question = input("Enter your question: ")

with open("test.pdf", "rb") as f:

    files = {
        "file": ("test.pdf", f, "application/pdf")
    }

    data = {
        "question": question
    }

    response = requests.post(url, files=files, data=data)

print("\nSTATUS:", response.status_code)
print("RESPONSE:", response.text)