import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {

const navigate = useNavigate();

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [isLoading, setIsLoading] = useState(false);

const handleRegister = async () => {
    if (!name || !email || !password) {
        toast.error("Name, email and password are required");
        return;
    }

    setIsLoading(true);

    try {

        await axios.post(
            "https://task-expense-tracker-9p53.onrender.com/register",
            {
                name,
                email,
                password
            }
        );

        toast.success("Registration Successful");

        navigate("/");

    }
    catch (error) {

        console.log(error);

        toast.error(error.response?.data?.error ||
            "Registration Failed");

    }
    finally {

        setIsLoading(false);

    }

};

return (

    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 flex items-center justify-center p-6">

        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md">

            <div className="text-center mb-8">

                <img
                    src="https://images.hasgeek.com/embed/file/71066b2b020b4ae5aec79d483340b5be"
                    alt="iCompaas"
                    className="h-16 mx-auto mb-4"
                />

                <h1 className="text-3xl font-bold text-gray-800">
                    Create Account
                </h1>

                <p className="text-gray-500 mt-2">
                    Join the Task & Expense Tracker
                </p>

            </div>

            <div className="space-y-4">

                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    disabled={isLoading}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    className="
                    w-full
                    border
                    rounded-xl
                    p-3
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    "
                />

                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    disabled={isLoading}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    className="
                    w-full
                    border
                    rounded-xl
                    p-3
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    "
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    disabled={isLoading}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    className="
                    w-full
                    border
                    rounded-xl
                    p-3
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    "
                />

                <button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="
                    w-full
                    bg-blue-600
                    hover:bg-blue-700
                    disabled:bg-blue-400
                    disabled:cursor-not-allowed
                    text-white
                    py-3
                    rounded-xl
                    font-semibold
                    transition
                    flex
                    items-center
                    justify-center
                    gap-3
                    "
                >
                    {isLoading && (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}
                    {isLoading ? "Creating Account..." : "Register"}
                </button>

            </div>

            <div className="text-center mt-6">

                <p className="text-gray-600">

                    Already have an account?

                    <Link
                        to="/login"
                        className="
                        text-blue-600
                        font-semibold
                        ml-2
                        hover:underline
                        "
                    >
                        Login
                    </Link>

                </p>

            </div>

        </div>

    </div>

);

}

export default Register;
