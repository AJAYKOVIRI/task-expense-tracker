import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import api from "../services/api";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [savingExpenseId, setSavingExpenseId] = useState(null);

  const loadExpenses = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await api.get("/expenses", {
        headers: getAuthHeaders(),
      });

      setExpenses(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed To Load Expenses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(loadExpenses, 0);

    return () => window.clearTimeout(timerId);
  }, [loadExpenses]);

  const validateExpense = () => {
    if (!title.trim()) {
      toast.error("Expense title is required");
      return false;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Amount must be greater than zero");
      return false;
    }

    if (!category.trim()) {
      toast.error("Category is required");
      return false;
    }

    if (!date) {
      toast.error("Expense date is required");
      return false;
    }

    return true;
  };

  const createExpense = async () => {
    if (!validateExpense()) {
      return;
    }

    setIsCreating(true);

    try {
      const response = await api.post(
        "/expenses",
        {
          title: title.trim(),
          amount: Number(amount),
          category: category.trim(),
          date,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      const createdExpense = response.data?.expense || {
        id: Date.now(),
        title: title.trim(),
        amount: Number(amount),
        category: category.trim(),
        date,
        created_date: new Date().toLocaleString(),
      };

      toast.success("Expense Created Successfully");
      setExpenses((currentExpenses) => [createdExpense, ...currentExpenses]);
      setTitle("");
      setAmount("");
      setCategory("");
      setDate("");
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed To Create Expense"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const updateExpense = async (expense) => {
    const newAmount = prompt("Enter New Amount", expense.amount);

    if (!newAmount) {
      return;
    }

    if (Number(newAmount) <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    setSavingExpenseId(expense.id);

    try {
      const response = await api.put(
        `/expenses/${expense.id}`,
        {
          title: expense.title,
          amount: Number(newAmount),
          category: expense.category,
          date: expense.date,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      toast.success("Expense Updated Successfully");
      setExpenses((currentExpenses) =>
        currentExpenses.map((currentExpense) =>
          currentExpense.id === expense.id
            ? {
                ...currentExpense,
                ...(response.data?.expense || {}),
                amount: Number(newAmount),
              }
            : currentExpense
        )
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed To Update Expense");
    } finally {
      setSavingExpenseId(null);
    }
  };

  const deleteExpense = async (expenseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) {
      return;
    }

    setSavingExpenseId(expenseId);

    try {
      await api.delete(`/expenses/${expenseId}`, {
        headers: getAuthHeaders(),
      });

      toast.success("Expense Deleted Successfully");
      loadExpenses();
    } catch (error) {
      console.log(error);
      toast.error("Failed To Delete Expense");
    } finally {
      setSavingExpenseId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">Create Expense</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Expense Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded-xl p-3"
              required
            />

            <input
              type="number"
              placeholder="Amount"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border rounded-xl p-3"
              required
            />

            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded-xl p-3"
              required
            />

            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">
              Expense Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded-xl p-3 font-normal text-gray-900"
                required
              />
            </label>
          </div>

          <button
            onClick={createExpense}
            disabled={isCreating}
            className="
              mt-5
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-blue-400
              disabled:cursor-not-allowed
              text-white
              px-6
              py-3
              rounded-xl
              flex
              items-center
              gap-3
            "
          >
            {isCreating && (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isCreating ? "Creating..." : "Create Expense"}
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Expense Records</h1>

        {isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-5 text-gray-600">
            Loading expenses...
          </div>
        )}

        {!isLoading && expenses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-5 text-gray-600">
            No expenses found.
          </div>
        )}

        {expenses.map((expense) => (
          <div key={expense.id} className="bg-white rounded-2xl shadow-lg p-6 mb-5">
            <h3 className="text-2xl font-bold mb-3">{expense.title}</h3>

            <p className="text-3xl font-bold text-green-600 mb-3">
              Rs. {expense.amount}
            </p>

            <p className="mb-3">
              Category:
              <span className="ml-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {expense.category}
              </span>
            </p>

            <p className="text-gray-600 mb-3">
              Expense Date: {expense.date}
            </p>

            <p className="text-gray-600 mb-4">
              Created Date:{" "}
              {expense.created_date || "Created before tracking was enabled"}
            </p>

            <button
              onClick={() => updateExpense(expense)}
              disabled={savingExpenseId === expense.id}
              className="
                bg-yellow-500
                hover:bg-yellow-600
                disabled:bg-yellow-300
                disabled:cursor-not-allowed
                text-white
                px-4
                py-2
                rounded-lg
                mr-2
              "
            >
              Update
            </button>

            <button
              onClick={() => deleteExpense(expense.id)}
              disabled={savingExpenseId === expense.id}
              className="
                bg-red-500
                hover:bg-red-600
                disabled:bg-red-300
                disabled:cursor-not-allowed
                text-white
                px-4
                py-2
                rounded-lg
              "
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Expenses;
