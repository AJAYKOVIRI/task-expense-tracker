import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import api from "../services/api";

const TASK_STATUSES = ["Pending", "In Progress", "Completed", "Blocked", "On Hold"];

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedEndDate, setEstimatedEndDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [statusNotes, setStatusNotes] = useState("");
  const [taskDrafts, setTaskDrafts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [savingTaskId, setSavingTaskId] = useState(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await api.get("/tasks", {
        headers: getAuthHeaders(),
      });

      setTasks(response.data);
      setTaskDrafts(
        response.data.reduce((drafts, task) => {
          drafts[task.id] = {
            status: task.status || "Pending",
            status_notes: task.status_notes || "",
          };
          return drafts;
        }, {})
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed To Load Tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(loadTasks, 0);

    return () => window.clearTimeout(timerId);
  }, [loadTasks]);

  const validateTask = () => {
    if (!title.trim()) {
      toast.error("Task title is required");
      return false;
    }

    if (!description.trim()) {
      toast.error("Task description is required");
      return false;
    }

    if (!estimatedEndDate) {
      toast.error("Estimated end date and time are required");
      return false;
    }

    return true;
  };

  const createTask = async () => {
    if (!validateTask()) {
      return;
    }

    setIsCreating(true);

    try {
      const response = await api.post(
        "/tasks",
        {
          title: title.trim(),
          description: description.trim(),
          estimated_end_date: estimatedEndDate,
          due_date: estimatedEndDate,
          status,
          status_notes: statusNotes.trim(),
        },
        {
          headers: getAuthHeaders(),
        }
      );

      const createdTask = response.data?.task || {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        status,
        status_notes: statusNotes.trim(),
        created_date: new Date().toLocaleString(),
        estimated_end_date: estimatedEndDate,
        due_date: estimatedEndDate,
      };

      toast.success("Task Created Successfully");
      setTasks((currentTasks) => [createdTask, ...currentTasks]);
      setTaskDrafts((currentDrafts) => ({
        ...currentDrafts,
        [createdTask.id]: {
          status: createdTask.status || "Pending",
          status_notes: createdTask.status_notes || "",
        },
      }));
      setTitle("");
      setDescription("");
      setEstimatedEndDate("");
      setStatus("Pending");
      setStatusNotes("");
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed To Create Task"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const deleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    setSavingTaskId(taskId);

    try {
      await api.delete(`/tasks/${taskId}`, {
        headers: getAuthHeaders(),
      });

      toast.success("Task Deleted Successfully");
      loadTasks();
    } catch (error) {
      console.log(error);
      toast.error("Failed To Delete Task");
    } finally {
      setSavingTaskId(null);
    }
  };

  const updateTaskStatus = async (taskId) => {
    setSavingTaskId(taskId);

    const draft = taskDrafts[taskId] || {};

    try {
      const response = await api.put(
        `/tasks/${taskId}`,
        {
          status: draft.status || "Pending",
          status_notes: draft.status_notes || "",
        },
        {
          headers: getAuthHeaders(),
        }
      );

      const updatedTask = response.data?.task;

      toast.success("Task Updated Successfully");
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...(updatedTask || {}),
                status: draft.status || task.status,
                status_notes: draft.status_notes || "",
              }
            : task
        )
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed To Update Task");
    } finally {
      setSavingTaskId(null);
    }
  };

  const updateTaskDraft = (taskId, field, value) => {
    setTaskDrafts((currentDrafts) => ({
      ...currentDrafts,
      [taskId]: {
        status: currentDrafts[taskId]?.status || "Pending",
        status_notes: currentDrafts[taskId]?.status_notes || "",
        [field]: value,
      },
    }));
  };

  const getStatusClass = (taskStatus) => {
    if (taskStatus === "Completed") {
      return "bg-green-100 text-green-700";
    }

    if (taskStatus === "Blocked") {
      return "bg-red-100 text-red-700";
    }

    if (taskStatus === "On Hold") {
      return "bg-purple-100 text-purple-700";
    }

    if (taskStatus === "In Progress") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">Create Task</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded-xl p-3"
              required
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-xl p-3"
              required
            />

            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">
              Estimated End Date & Time
              <input
                type="datetime-local"
                value={estimatedEndDate}
                onChange={(e) => setEstimatedEndDate(e.target.value)}
                className="border rounded-xl p-3 font-normal text-gray-900"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded-xl p-3 font-normal text-gray-900"
              >
                {TASK_STATUSES.map((taskStatus) => (
                  <option key={taskStatus} value={taskStatus}>
                    {taskStatus}
                  </option>
                ))}
              </select>
            </label>

            <textarea
              placeholder="Status Notes (optional)"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              className="border rounded-xl p-3 md:col-span-2 min-h-24"
            />
          </div>

          <button
            onClick={createTask}
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
            {isCreating ? "Creating..." : "Create Task"}
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-6">My Tasks</h1>

        {isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-5 text-gray-600">
            Loading tasks...
          </div>
        )}

        {!isLoading && tasks.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-5 text-gray-600">
            No tasks found.
          </div>
        )}

        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-2xl shadow-lg p-6 mb-5">
            <h3 className="text-2xl font-bold mb-3">{task.title}</h3>

            <p className="text-gray-600 mb-3">Description: {task.description}</p>

            <p className="mb-3">
              Status:
              <span
                className={`ml-2 px-3 py-1 rounded-full ${getStatusClass(
                  task.status
                )}`}
              >
                {task.status}
              </span>
            </p>

            {task.status_notes && (
              <p className="text-gray-600 mb-3">
                Status Notes: {task.status_notes}
              </p>
            )}

            <p className="text-gray-600 mb-3">
              Created Date:{" "}
              {task.created_date || "Created before tracking was enabled"}
            </p>

            <p className="text-gray-600 mb-4">
              Estimated End Date: {task.estimated_end_date || task.due_date}
            </p>

            <div className="flex flex-wrap gap-2">
              <select
                value={taskDrafts[task.id]?.status || task.status || "Pending"}
                onChange={(e) =>
                  updateTaskDraft(task.id, "status", e.target.value)
                }
                className="border rounded-lg px-4 py-2"
              >
                {TASK_STATUSES.map((taskStatus) => (
                  <option key={taskStatus} value={taskStatus}>
                    {taskStatus}
                  </option>
                ))}
              </select>

              <textarea
                value={taskDrafts[task.id]?.status_notes || ""}
                onChange={(e) =>
                  updateTaskDraft(task.id, "status_notes", e.target.value)
                }
                placeholder="Status Notes (optional)"
                className="border rounded-lg px-4 py-2 min-h-10 flex-1 min-w-64"
              />

              <button
                onClick={() => updateTaskStatus(task.id)}
                disabled={savingTaskId === task.id}
                className="
                  bg-green-600
                  hover:bg-green-700
                  disabled:bg-green-300
                  disabled:cursor-not-allowed
                  text-white
                  px-4
                  py-2
                  rounded-lg
                "
              >
                Save Status
              </button>

              <button
                onClick={() => deleteTask(task.id)}
                disabled={savingTaskId === task.id}
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tasks;
