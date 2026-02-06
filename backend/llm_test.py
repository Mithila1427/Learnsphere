from transformers import pipeline

# Use a supported pipeline task
generator = pipeline(
    task="text-generation",
    model="google/flan-t5-base"
)

prompt = "Reply with exactly: LLM is working."

response = generator(prompt, max_new_tokens=20)

print(response[0]["generated_text"])
