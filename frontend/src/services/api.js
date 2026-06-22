import axios from "axios";

const api = axios.create({
    baseURL: "https://task-expense-tracker-9p53.onrender.com"
});

export default api;