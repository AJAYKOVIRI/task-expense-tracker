import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_tasks: 0,
    total_expenses: 0,
    total_expense_amount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(loadStats, 0);

    return () => window.clearTimeout(timerId);
  }, [loadStats]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>

          <p className="text-gray-500 mt-2">Overview of the entire system.</p>
        </div>

        {isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-gray-600">
            Loading admin dashboard...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-500 text-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg">Total Users</h3>
            <h1 className="text-5xl font-bold mt-3">{stats.total_users}</h1>
          </div>

          <div className="bg-green-500 text-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg">Total Tasks</h3>
            <h1 className="text-5xl font-bold mt-3">{stats.total_tasks}</h1>
          </div>

          <div className="bg-purple-500 text-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg">Total Expenses</h3>
            <h1 className="text-5xl font-bold mt-3">{stats.total_expenses}</h1>
          </div>

          <div className="bg-orange-500 text-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg">Expense Amount</h3>
            <h1 className="text-4xl font-bold mt-3">
              Rs. {stats.total_expense_amount}
            </h1>
          </div>
        </div>

        <div className="mt-10 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">System Summary</h2>

          <p className="text-gray-600 mb-3">
            Registered Users:
            <span className="font-bold text-blue-600 ml-2">
              {stats.total_users}
            </span>
          </p>

          <p className="text-gray-600 mb-3">
            Tasks Created:
            <span className="font-bold text-green-600 ml-2">
              {stats.total_tasks}
            </span>
          </p>

          <p className="text-gray-600 mb-3">
            Expense Records:
            <span className="font-bold text-purple-600 ml-2">
              {stats.total_expenses}
            </span>
          </p>

          <p className="text-gray-600">
            Total Money Tracked:
            <span className="font-bold text-orange-600 ml-2">
              Rs. {stats.total_expense_amount}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
