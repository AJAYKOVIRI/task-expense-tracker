import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await api.post("/login", {
        email: email,
        password: password,
      });

      console.log("Login Response:", response.data);

      const token = response.data.access_token || response.data.token;

      if (!token) {
        toast.error("Token not found in response");

        return;
      }

      localStorage.setItem("token", token);

      localStorage.setItem("role", response.data.role);

      localStorage.setItem("user", response.data.user);

      console.log("Stored Token:", localStorage.getItem("token"));

      navigate("/dashboard");
    } catch (error) {
      console.log(error);


      toast.error(error.response?.data?.message ||
          error.response?.data?.msg ||
          "Login Failed",);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex justify-center items-center">
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-[400px] border border-white/20">
        <div className="flex justify-center mb-6">
          <img
            src="https://images.hasgeek.com/embed/file/71066b2b020b4ae5aec79d483340b5be"
            alt="iCompaas Logo"
            className="h-20 object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Task & Expense Tracker
        </h1>

        <p className="text-center text-gray-300 mb-8">Welcome Back</p>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-xl mb-4 bg-white/20 text-white placeholder-gray-300 outline-none border border-white/20"
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-xl mb-6 bg-white/20 text-white placeholder-gray-300 outline-none border border-white/20"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-semibold p-3 rounded-xl"
        >
          Login
        </button>

        <p className="text-center text-gray-300 mt-6">Don't have an account?</p>

        <button
          onClick={() => navigate("/register")}
          className="w-full mt-3 border border-white/30 text-white hover:bg-white/10 transition-all duration-300 p-3 rounded-xl"
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Login;
