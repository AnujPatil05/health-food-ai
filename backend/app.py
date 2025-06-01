# backend/app.py

from fastapi import FastAPI
from transformers import pipeline
from pydantic import BaseModel

app = FastAPI()

# Load Hugging Face model
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Input model for POST requests
class FoodCheckRequest(BaseModel):
    food_item: str
    health_condition: str

@app.get("/")
def read_root():
    return {"message": "NutriGuard API is running!"}

@app.post("/check-food")
def check_food(data: FoodCheckRequest):
    labels = ["safe to eat", "risky for health"]
    input_text = f"{data.food_item} while having {data.health_condition}"
    result = classifier(input_text, labels)

    return {
        "food_item": data.food_item,
        "health_condition": data.health_condition,
        "result": result["labels"][0],  # Most likely label
        "score": round(result["scores"][0] * 100, 2)
    }
