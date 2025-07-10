import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import CheckFood from "./pages/CheckFood";
import DayPlanner from "./pages/DayPlanner";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/check-food" />} />
        <Route path="/check-food" element={<CheckFood />} />
        <Route path="/day-planner" element={<DayPlanner />} />
      </Routes>
    </Router>
  );
}

export default App;