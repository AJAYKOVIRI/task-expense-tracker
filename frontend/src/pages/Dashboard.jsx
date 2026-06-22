import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";


function Dashboard() {

  const [dashboardData, setDashboardData] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    total_expenses: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:5000/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboardData(response.data);

    } catch (error) {

      console.log(error);

    }
  };

  const user = localStorage.getItem("user");

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="max-w-7xl mx-auto p-8">

        <div className="mb-10">

          <h1 className="text-4xl font-bold text-gray-800">
            Welcome, {user} 👋
          </h1>

          <p className="text-gray-500 mt-2">
            Here's an overview of your activities.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Total Tasks */}

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <p className="text-gray-500">
              Total Tasks
            </p>

            <h2 className="text-4xl font-bold mt-3 text-blue-600">
              {dashboardData.total_tasks}
            </h2>

          </div>

          {/* Completed Tasks */}

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <p className="text-gray-500">
              Completed Tasks
            </p>

            <h2 className="text-4xl font-bold mt-3 text-green-600">
              {dashboardData.completed_tasks}
            </h2>

          </div>

          {/* Pending Tasks */}

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <p className="text-gray-500">
              Pending Tasks
            </p>

            <h2 className="text-4xl font-bold mt-3 text-yellow-500">
              {dashboardData.pending_tasks}
            </h2>

          </div>

          {/* Expenses */}

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <p className="text-gray-500">
              Total Expenses
            </p>

            <h2 className="text-4xl font-bold mt-3 text-red-500">
              ₹{dashboardData.total_expenses}
            </h2>

          </div>

        </div>

        {/* Summary Section */}

        <div className="mt-10 bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-bold mb-4">
            Quick Summary
          </h2>

          <p className="text-gray-600">
            You currently have{" "}
            <span className="font-bold text-blue-600">
              {dashboardData.total_tasks}
            </span>{" "}
            tasks, out of which{" "}
            <span className="font-bold text-green-600">
              {dashboardData.completed_tasks}
            </span>{" "}
            are completed and{" "}
            <span className="font-bold text-yellow-600">
              {dashboardData.pending_tasks}
            </span>{" "}
            are still pending.
          </p>

          <p className="text-gray-600 mt-3">
            Your total recorded expenses are{" "}
            <span className="font-bold text-red-600">
              ₹{dashboardData.total_expenses}
            </span>.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;