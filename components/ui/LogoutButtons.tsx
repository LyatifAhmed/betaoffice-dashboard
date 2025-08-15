// components/ui/LogoutButtons.tsx
"use client";
import { useRouter } from "next/navigation";

export default function LogoutButtons() {
  const router = useRouter();

  const logout = async (fullClear = false) => {
    await fetch("/api/logout", { method: "POST" });
    if (fullClear) {
      localStorage.clear(); // tüm lokal verileri sil
    }
    router.push("/login");
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => logout(false)}
        className="w-full px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-white"
      >
        Normal Logout
      </button>
      <button
        onClick={() => logout(true)}
        className="w-full px-3 py-2 rounded bg-red-500/80 hover:bg-red-500 text-white"
      >
        Full Logout (Clear All Data)
      </button>
    </div>
  );
}
