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

  // Helper to format confidence and labels
  const formatConfidence = (value) => `${Math.round(value * 100)}%`;
  const isSafe = result?.ai_judgment.toLowerCase().includes("yes");

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-200 to-cyan-100
      flex items-center justify-center px-4 py-12">
      <div className="backdrop-blur-md backdrop-saturate-150 bg-white/30 border border-white/30 
                shadow-lg rounded-xl p-6 w-full max-w-md min-w-[350px]">

        <h1 className="text-3xl font-bold mb-6 text-center text-green-800">🩺 Food Suitability Checker AI</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Illness</label>
            <input
              type="text"
              value={illness}
              onChange={(e) => setIllness(e.target.value)}
              placeholder="e.g. sore throat"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Food Item</label>
            <input
              type="text"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="e.g. curd"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-xl hover:bg-green-700 transition"
          >
            {loading ? "Checking..." : "Check Suitability"}
          </button>
        </form>

        {/* Result Section */}
        {result && (
          <div className="mt-6 p-4 border border-gray-200 rounded-xl bg-gray-50 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-800">Decision:</span>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  isSafe
                    ? "bg-green-100 text-green-700 border border-green-400"
                    : "bg-red-100 text-red-700 border border-red-400"
                }`}
              >
                {isSafe ? "✅ Safe to Eat" : "❌ Not Safe"}
              </span>
            </div>

            <div className="text-sm text-gray-600 mb-1">
              <strong>Confidence:</strong> {formatConfidence(result.ai_confidence)}
            </div>

            <p className="mt-2 text-gray-700 text-sm">{result.explaination}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-100 text-red-800 text-sm px-4 py-2 rounded-xl text-center border border-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
