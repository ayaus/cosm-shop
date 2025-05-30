"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import API from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("accessToken");
      if (!token) return router.push("/login");

      try {
        const me = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (me.data.role !== "superadmin") return router.push("/");

        setUser(me.data);

        const res = await API.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(res.data);
      } catch (err) {
        router.push("/login");
      }
    };

    fetchData();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    const token = Cookies.get("accessToken");
    try {
      await API.put(
        `/admin/users/${id}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
      );
    } catch {
      alert("Ошибка при изменении роли");
    }
  };

  if (!user)
    return (
      <p className="p-8 text-center text-gray-600 text-lg animate-pulse">
        Загрузка...
      </p>
    );

  return (
    <main className="min-h-screen p-6 flex justify-center items-start">
      <div className="w-full max-w-5xl backdrop-blur-md bg-white/60 rounded-2xl shadow-lg p-6 border border-[#f5d0aa]">
        <h2 className="text-3xl font-semibold text-center mb-8 text-[#5a3e2b]">
          Управление пользователями
        </h2>

        <div className="overflow-x-auto rounded-xl border border-[#f5d0aa] shadow-inner bg-white/40">
          <table className="w-full table-auto text-sm">
            <thead className="bg-[#fdf1e5] text-[#7a5038] font-semibold">
              <tr>
                <th className="p-4 border border-[#f5d0aa]">Имя</th>
                <th className="p-4 border border-[#f5d0aa]">Email</th>
                <th className="p-4 border border-[#f5d0aa]">Роль</th>
                <th className="p-4 border border-[#f5d0aa]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="text-center hover:bg-[#fdf5ef] transition-all duration-200"
                >
                  <td className="p-4 border border-[#f5d0aa] text-[#5a3e2b]">
                    {u.name}
                  </td>
                  <td className="p-4 border border-[#f5d0aa] text-[#5a3e2b]">
                    {u.email}
                  </td>
                  <td className="p-4 border border-[#f5d0aa] capitalize text-[#8a5a3d]">
                    {u.role}
                  </td>
                  <td className="p-4 border border-[#f5d0aa] space-x-2">
                    {["user", "admin", "superadmin"].map((r) => (
                      <button
                        key={r}
                        onClick={() => handleRoleChange(u._id, r)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          u.role === r
                            ? "bg-[#e2c9aa] text-[#7a5038] cursor-not-allowed"
                            : "bg-gradient-to-r from-[#f7b267] to-[#f79d65] text-white hover:opacity-90"
                        }`}
                        disabled={u.role === r}
                      >
                        {r}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
