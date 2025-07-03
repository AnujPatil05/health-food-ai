import { useState } from "react";

function App() {
  const [illness, setIllness] = useState("");
  const [food, setFood] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/check-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ illness, food_item: food })
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-blue-600
 flex items-center justify-center">


      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/30">
        <h1 className="text-2xl font-bold mb-4 text-center">🩺 Food Suitability Checker</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">Illness</label>
            <input
              type="text"
              value={illness}
              onChange={(e) => setIllness(e.target.value)}
              placeholder="e.g. fever"
              className="w-full px-4 py-2 border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Food Item</label>
            <input
              type="text"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="e.g. curd"
              className="w-full px-4 py-2 border rounded-xl"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </form>

        {/* 🔍 Show results */}
        {result && (
          <div className="mt-6 p-4 border rounded-xl bg-gray-50">
            <p><strong>Decision:</strong> {result.ai_judgment}</p>
            <p><strong>Confidence:</strong> {result.ai_confidence}</p>
            <p className="mt-2 text-sm text-gray-700">{result.explaination}</p>
          </div>
        )}

        {/* ⚠️ Error Handling */}
        {error && (
          <div className="mt-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
