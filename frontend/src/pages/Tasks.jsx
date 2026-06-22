import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

function Tasks() {
const [tasks, setTasks] = useState([]);

const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [dueDate, setDueDate] = useState("");
const [status, setStatus] = useState("Pending");

useEffect(() => {
loadTasks();
}, []);

const loadTasks = async () => {
try {
const token = localStorage.getItem("token");

  const response = await axios.get(
    "https://task-expense-tracker-9p53.onrender.com/tasks",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setTasks(response.data);

} catch (error) {
  console.log(error);
}

};

const createTask = async () => {
try {
const token = localStorage.getItem("token");

  await axios.post(
    "https://task-expense-tracker-9p53.onrender.com/tasks",
    {
      title,
      description,
      due_date: dueDate,
      status,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  toast.success("Task Created Successfully");

  setTitle("");
  setDescription("");
  setDueDate("");
  setStatus("Pending");

  loadTasks();

} catch (error) {
  console.log(error);

  toast.error("Failed To Create Task");
}


};

const deleteTask = async (taskId) => {

const confirmDelete = window.confirm(
  "Are you sure you want to delete this task?"
);

if (!confirmDelete) {
  return;
}

try {

  const token = localStorage.getItem("token");

  await axios.delete(
    `https://task-expense-tracker-9p53.onrender.com/tasks/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  loadTasks();

} catch (error) {

  console.log(error);

  toast.error("Failed To Delete Task");
}

};

const updateTaskStatus = async (taskId) => {

try {

  const token = localStorage.getItem("token");

  await axios.put(
    `https://task-expense-tracker-9p53.onrender.com/tasks/${taskId}`,
    {
      status: "Completed",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  toast.success("Task Updated Successfully");

  loadTasks();

} catch (error) {

  console.log(error);

  toast.error("Failed To Update Task");
}

};

return ( <div className="min-h-screen bg-gray-100">

  <Navbar />

  <div className="max-w-7xl mx-auto p-8">

    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">

      <h2 className="text-3xl font-bold mb-6">
        Create Task
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="border rounded-xl p-3"
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="border rounded-xl p-3"
        />

        <input
          type="text"
          placeholder="Due Date"
          value={dueDate}
          onChange={(e) =>
            setDueDate(e.target.value)
          }
          className="border rounded-xl p-3"
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="border rounded-xl p-3"
        >
          <option value="Pending">
            Pending
          </option>

          <option value="Completed">
            Completed
          </option>
        </select>

      </div>

      <button
        onClick={createTask}
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
        Create Task
      </button>

    </div>

    <h1 className="text-3xl font-bold mb-6">
      My Tasks
    </h1>

    {tasks.map((task) => (

      <div
        key={task.id}
        className="
        bg-white
        rounded-2xl
        shadow-lg
        p-6
        mb-5
        "
      >

        <h3 className="text-2xl font-bold mb-3">
          {task.title}
        </h3>

        <p className="text-gray-600 mb-3">
          Description: {task.description}
        </p>

        <p className="mb-3">

          Status:

          <span
            className={
              task.status === "Completed"
                ? "ml-2 bg-green-100 text-green-700 px-3 py-1 rounded-full"
                : "ml-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full"
            }
          >
            {task.status}
          </span>

        </p>

        <p className="text-gray-600 mb-4">
          Due Date: {task.due_date}
        </p>

        {task.status !== "Completed" && (

          <button
            onClick={() =>
              updateTaskStatus(task.id)
            }
            className="
            bg-green-500
            hover:bg-green-600
            text-white
            px-4
            py-2
            rounded-lg
            mr-2
            "
          >
            Complete
          </button>

        )}

        <button
          onClick={() =>
            deleteTask(task.id)
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

export default Tasks;
