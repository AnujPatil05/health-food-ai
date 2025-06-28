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

    # ai_judgment = "yes" if "suitable" in top_label and confidence > 0.7 else "no"
    if "suitable" in top_label:
        if confidence > 0.8:
            ai_judgment = "Higly recommended"
        elif confidence >0.6:
            ai_judgment= "Probably suitable"
        else : 
            ai_judgment= "Uncertain"
    else:
        if confidence > 0.8:
            ai_judgment = "Strongly not recommended"
        elif confidence >0.6:
            ai_judgment= "Probably not recommended"
        else : 
            ai_judgment= "Uncertain"
        

    # Optional: fallback rule-based logic if AI is unsure
    rule_based = rules.get(illness, {}).get("avoid", [])
    rule_check = "no" if food in rule_based else "yes"

    log_entry ={
        "illness" : illness,
        "food" : food,
        "ai_label" : ai_judgment,
        "confidence" : round(confidence,2)
    }
    
    with open("log_data.jsonl", "a") as logfile:
        logfile.write(json.dumps(log_entry)+ "\n")

    return {
        "illness": illness,
        "food": food,
        "ai_judgment": ai_judgment,
        "ai_confidence": confidence,
        "rule_based_check": rule_check
    }