import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("admin-authed") === "true") {
      router.push("/admin/invites");
    }
  }, []);

  const handleLogin = async () => {
    const res = await fetch("/api/admin-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      localStorage.setItem("admin-authed", "true");
      router.push("/admin/invites");
    } else {
      setError("Incorrect username or password.");
    }
  };

  return (
    <div className="p-8 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Admin Login</h1>
      <input
        className="border w-full mb-2 p-2"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="border w-full mb-2 p-2"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-black text-white px-4 py-2 rounded w-full" onClick={handleLogin}>
        Login
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
