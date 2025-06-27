from fastapi import FastAPI, Request
from transformers import pipeline
from pydantic import BaseModel
import json

app = FastAPI()

# Load HuggingFace classifier
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Optional: Load fallback rules from JSON
try:
    with open("rules.json", "r") as file:
        rules = json.load(file)
except FileNotFoundError:
    rules = {}

class FoodCheckRequest(BaseModel):
    illness: str
    food_item: str

@app.post("/check-food")
async def check_food(data: FoodCheckRequest):
    illness = data.illness.lower()
    food = data.food_item.lower()

    # AI-powered classification
    labels = [f"suitable for {illness}", f"bad for {illness}"]
    result = classifier(food, candidate_labels=labels)

    top_label = result["labels"][0]
    confidence = result["scores"][0]

    ai_judgment = "yes" if "suitable" in top_label and confidence > 0.7 else "no"

    # Optional: fallback rule-based logic if AI is unsure
    rule_based = rules.get(illness, {}).get("not_allowed", [])
    rule_check = "no" if food in rule_based else "yes"

    return {
        "illness": illness,
        "food": food,
        "ai_judgment": ai_judgment,
        "ai_confidence": confidence,
        "rule_based_check": rule_check
    }
