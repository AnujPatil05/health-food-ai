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
    
    
    illness_rules = rules.get(illness, {})
    not_allowed = illness_rules.get("avoid", [])
    allowed = illness_rules.get("recommended", [])
    
    if food in not_allowed:
        ai_judgment = "Strongly not recommended"
        explanation = f"{food.title()} is commonly known to worsen {illness}. This advice is based on dietary health guidelines."
        confidence = 0.95
    elif food in allowed:
        ai_judgment = "Suitable"
        explanation = f"{food.title()} is commonly suitable for {illness}. This advice is based on dietary health guidelines."
        confidence = 0.95  
    else:
        # ai_judgment = "yes" if "suitable" in top_label and confidence > 0.7 else "no"
        sentence = f"Can a person with {illness} eat {food}?"
        # AI-powered classification
        labels = [
            f"safe to eat with {illness}",
            f"unsafe to eat with {illness}",
            f"may cause problems with {illness}",
            f"helps recover from {illness}",
            f"has no effect on {illness}"
        ]
        result = classifier(sentence, candidate_labels=labels)
        top_label = result["labels"][0]
        confidence = result["scores"][0]

        if "safe" in top_label or "helps" in top_label:
            if confidence > 0.8:
                ai_judgment = "Highly recommended"
                explanation = f"{food.title()} is considered beneficial or safe for someone with {illness}."
            elif confidence > 0.6:
                ai_judgment = "Probably suitable"
                explanation = f"{food.title()} is likely safe for {illness}, though not with strong certainty."
            else:
                ai_judgment = "Uncertain"
                explanation = f"AI is unsure if {food} is suitable for {illness}."
        elif "unsafe" in top_label or "problems" in top_label:
            if confidence > 0.8:
                ai_judgment = "Strongly not recommended"
                explanation = f"{food.title()} is likely harmful or may worsen {illness}. Consider avoiding it."
            elif confidence > 0.6:
                ai_judgment = "Probably not suitable"
                explanation = f"{food.title()} might not be the best option if you have {illness}, but confidence is moderate."
            else:
                ai_judgment = "Uncertain"
                explanation = f"AI could not confidently determine if {food} is unsafe for {illness}."
        else:
            ai_judgment = "Uncertain"
            explanation = f"The AI thinks {food} may not have a strong effect on {illness}, but it's unsure."
        

    # Optional: fallback rule-based logic if AI is unsure
    rule_based = rules.get(illness, {}).get("avoid", [])
    rule_check = "no" if food in rule_based else "yes"

    log_entry ={
        "illness" : illness,
        "food" : food,
        "ai_label" : ai_judgment,
        "confidence" : round(confidence,2),
        "explaination" : explanation
    }
    
    with open("log_data.jsonl", "a") as logfile:
        logfile.write(json.dumps(log_entry)+ "\n")

    return {
        "illness": illness,
        "food": food,
        "ai_judgment": ai_judgment,
        "ai_confidence": confidence,
        "rule_based_check": rule_check,
        "explaination": explanation
    }