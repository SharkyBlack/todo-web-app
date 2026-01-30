import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      setLoading(true);
      const res = await api.post("/auth/register", { email, password });
      setMsg(res.data.message || "Registered successfully!");

      setTimeout(() => navigate("/login"), 900);
    } catch (error) {
      setErr(error?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold">Register</h2>
        <p className="text-gray-500 text-sm mt-1">Create a new account</p>

        {err && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            {err}
          </div>
        )}

        {msg && (
          <div className="mt-4 bg-green-100 text-green-700 p-3 rounded-lg text-sm">
            {msg}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-5 space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link className="text-black font-semibold" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
