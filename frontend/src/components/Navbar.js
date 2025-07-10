import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-md p-4 flex justify-center gap-6">
      <Link
        to="/check-food"
        className={`font-semibold ${location.pathname === "/check-food"
          ? "text-blue-700 underline"
          : "text-blue-600 hover:underline"}`}
      >
        🧪 Check Food
      </Link>
      <Link
        to="/day-planner"
        className={`font-semibold ${location.pathname === "/day-planner"
          ? "text-green-700 underline"
          : "text-green-600 hover:underline"}`}
      >
        📅 Day Planner
      </Link>
    </nav>
  );
}

export default Navbar;