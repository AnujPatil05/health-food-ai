from fastapi import FastAPI, Query
from pydantic import BaseModel
import json

app = FastAPI()

# Load rule data
with open("rules.json") as f:
    FOOD_RULES = json.load(f)

class FoodQuery(BaseModel):
    illness: str
    food_item: str

@app.post("/check-food")
def check_food(query: FoodQuery):
    illness = query.illness.lower()
    food = query.food_item.lower()

    if illness not in FOOD_RULES:
        return {
            "status": "unknown",
            "message": f"No rules found for illness: {illness}"
        }

    avoid = [f.lower() for f in FOOD_RULES[illness]["avoid"]]
    recommended = [f.lower() for f in FOOD_RULES[illness]["recommended"]]

    if food in avoid:
        return {
            "status": "avoid",
            "message": f"{food.title()} should be avoided when you have {illness}."
        }
    elif food in recommended:
        return {
            "status": "recommended",
            "message": f"{food.title()} is good for you when you have {illness}."
        }
    else:
        return {
            "status": "neutral",
            "message": f"{food.title()} is not explicitly listed for {illness}, so consult a doctor if unsure."
        }
