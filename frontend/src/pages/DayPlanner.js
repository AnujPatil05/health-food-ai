import { useState } from "react";

function DayPlanner () {
  const [illness, setIllness] = useState("");
  const [mealInput, setMealInput] = useState("");
  const [meals, setMeals] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const addMeal = () => {
    if (mealInput.trim()) {
      setMeals([...meals, mealInput.trim()]);
      setMealInput("");
    }
  };

  const removeMeal = (index) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const analyzePlan = async () => {
    if (!illness || meals.length === 0) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/check-day-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ illness, meals }),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error analyzing day plan:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-200 to-cyan-100flex items-center justify-center px-4 py-12">
    <div className="max-w-xl mx-auto mt-10 p-6 backdrop-blur-md backdrop-saturate-150 bg-white/30 rounded-2xl shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-800">📅 Full-Day Meal Planner</h2>

      <input
        type="text"
        value={illness}
        onChange={(e) => setIllness(e.target.value)}
        placeholder="Enter illness (e.g. fever)"
        className="w-full px-4 py-2 border mb-4 rounded-xl"
      />

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={mealInput}
          onChange={(e) => setMealInput(e.target.value)}
          placeholder="Enter food item"
          className="flex-1 px-4 py-2 border rounded-xl"
        />
        <button
          onClick={addMeal}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
        >
          + Add
        </button>
      </div>

      {meals.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Meals Added:</h3>
          <ul className="space-y-1">
            {meals.map((meal, i) => (
              <li key={i} className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-xl">
                <span>{meal}</span>
                <button
                  onClick={() => removeMeal(i)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={analyzePlan}
        disabled={loading || !illness || meals.length === 0}
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Analyzing..." : "Analyze Day Plan"}
      </button>

      {results && (
        <div className="mt-6">
          <h4 className="font-bold mb-2">🧾 Results:</h4>
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1">Food</th>
                <th className="px-2 py-1">Decision</th>
                <th className="px-2 py-1">Explanation</th>
              </tr>
            </thead>
            <tbody>
              {results.results.map((item, i) => (
                <tr key={i} className="text-center">
                  <td className="border px-2 py-1">{item.food}</td>
                  <td
                    className={`border px-2 py-1 font-semibold ${
                      item.decision === "Safe"
                        ? "text-green-600"
                        : item.decision === "Risky"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {item.decision}
                  </td>
                  <td className="border px-2 py-1">{item.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 font-medium text-center">
            ✅ Overall judgment:{" "}
            <span className="text-blue-600">{results.overall_judgment}</span>
          </p>
        </div>
      )}
    </div>
   </div>
  );
}
export default DayPlanner;
