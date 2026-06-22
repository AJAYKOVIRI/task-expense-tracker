import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

function Expenses() {
const [expenses, setExpenses] = useState([]);

const [title, setTitle] = useState("");
const [amount, setAmount] = useState("");
const [category, setCategory] = useState("");
const [date, setDate] = useState("");

useEffect(() => {
loadExpenses();
}, []);

const loadExpenses = async () => {
try {
const token = localStorage.getItem("token");


  const response = await axios.get(
    "http://127.0.0.1:5000/expenses",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setExpenses(response.data);

} catch (error) {
  console.log(error);
}


};

const createExpense = async () => {
try {
const token = localStorage.getItem("token");

  await axios.post(
    "http://127.0.0.1:5000/expenses",
    {
      title,
      amount,
      category,
      date,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  toast.success("Expense Created Successfully");

  setTitle("");
  setAmount("");
  setCategory("");
  setDate("");

  loadExpenses();

} catch (error) {
  console.log(error);

  toast.error("Failed To Create Expense");
}


};

const updateExpense = async (expense) => {
try {
const token = localStorage.getItem("token");


  const newAmount = prompt(
    "Enter New Amount",
    expense.amount
  );

  if (!newAmount) return;

  await axios.put(
    `http://127.0.0.1:5000/expenses/${expense.id}`,
    {
      title: expense.title,
      amount: newAmount,
      category: expense.category,
      date: expense.date,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  loadExpenses();

} catch (error) {
  console.log(error);
}

};

const deleteExpense = async (expenseId) => {


const confirmDelete = window.confirm(
  "Are you sure you want to delete this expense?"
);

if (!confirmDelete) {
  return;
}

try {

  const token = localStorage.getItem("token");

  await axios.delete(
    `http://127.0.0.1:5000/expenses/${expenseId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  loadExpenses();

} catch (error) {

  console.log(error);

  toast.error("Failed To Delete Expense");
}


};

return ( <div className="min-h-screen bg-gray-100">


  <Navbar />

  <div className="max-w-7xl mx-auto p-8">

    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">

      <h2 className="text-3xl font-bold mb-6">
        Create Expense
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        <input
          type="text"
          placeholder="Expense Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="border rounded-xl p-3"
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className="border rounded-xl p-3"
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="border rounded-xl p-3"
        />

        <input
          type="text"
          placeholder="Date"
          value={date}
          onChange={(e) =>
            setDate(e.target.value)
          }
          className="border rounded-xl p-3"
        />

      </div>

      <button
        onClick={createExpense}
        className="
        mt-5
        bg-blue-600
        hover:bg-blue-700
        text-white
        px-6
        py-3
        rounded-xl
        "
      >
        Create Expense
      </button>

    </div>

    <h1 className="text-3xl font-bold mb-6">
      Expense Records
    </h1>

    {expenses.map((expense) => (

      <div
        key={expense.id}
        className="
        bg-white
        rounded-2xl
        shadow-lg
        p-6
        mb-5
        "
      >

        <h3 className="text-2xl font-bold mb-3">
          {expense.title}
        </h3>

        <p className="text-3xl font-bold text-green-600 mb-3">
          ₹{expense.amount}
        </p>

        <p className="mb-3">

          Category:

          <span
            className="
            ml-2
            bg-blue-100
            text-blue-700
            px-3
            py-1
            rounded-full
            "
          >
            {expense.category}
          </span>

        </p>

        <p className="text-gray-600 mb-4">
          Date: {expense.date}
        </p>

        <button
          onClick={() =>
            updateExpense(expense)
          }
          className="
          bg-yellow-500
          hover:bg-yellow-600
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
          onClick={() =>
            deleteExpense(expense.id)
          }
          className="
          bg-red-500
          hover:bg-red-600
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
