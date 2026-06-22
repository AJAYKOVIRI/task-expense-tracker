import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const role = localStorage.getItem("role");

  const user = localStorage.getItem("user");

  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <img
              src="https://images.hasgeek.com/embed/file/71066b2b020b4ae5aec79d483340b5be"
              alt="iCompaas"
              className="h-10"
            />

            <span className="font-bold text-lg">Task Tracker</span>
          </div>

          <div className="flex gap-6 items-center">
            <Link to="/dashboard">Dashboard</Link>

            <Link to="/tasks">Tasks</Link>

            <Link to="/expenses">Expenses</Link>

            {role === "Admin" && <Link to="/admin">Admin</Link>}

            <button
              onClick={() => setShowLogoutModal(true)}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {showLogoutModal && (
        <div
          className="
    fixed
    inset-0
    bg-black/50
    flex
    items-center
    justify-center
    z-50
    "
        >
          <div
            className="
      bg-white
      rounded-2xl
      shadow-2xl
      p-8
      w-96
      text-center
      "
          >
            <h2
              className="
        text-2xl
        font-bold
        text-gray-800
        mb-4
        "
            >
              Confirm Logout
            </h2>

            <p
              className="
        text-gray-600
        mb-6
        "
            >
              Are you sure you want to logout?
            </p>

            <div
              className="
        flex
        justify-center
        gap-4
        "
            >
              <button
                onClick={() => setShowLogoutModal(false)}
                className="
          px-5
          py-2
          rounded-lg
          bg-gray-300
          hover:bg-gray-400
          "
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="
          px-5
          py-2
          rounded-lg
          bg-red-500
          text-white
          hover:bg-red-600
          "
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
