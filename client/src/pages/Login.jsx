import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", res.data.user.email);

      navigate("/dashboard");
    } catch (error) {
      setErr(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold">Login</h2>
        <p className="text-gray-500 text-sm mt-1">Login to continue</p>

        {err && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            {err}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-5 space-y-3">
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          New here?{" "}
          <Link className="text-black font-semibold" to="/register">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
