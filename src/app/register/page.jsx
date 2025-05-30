"use client";
import { useState } from "react";
import API from "../../lib/api";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", form);
      alert("✅ Регистрация прошла успешно");
      router.push("/login");
    } catch (err) {
      console.error("Ошибка регистрации:", err?.response?.data || err.message);
      alert("❌ Ошибка регистрации: " + (err?.response?.data?.message || "Неизвестная ошибка"));
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fffaf5] via-[#fceee4] to-[#f8e1d4]">
      <div className="bg-white/80 backdrop-blur-md w-full max-w-md p-8 rounded-xl shadow-lg border border-[#f5d0aa]">
        <h2 className="text-center text-2xl font-semibold text-[#5a3e2b] mb-6 tracking-wide">Регистрация</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="relative">
            <FiUser className="absolute top-3 left-3 text-[#cba87d]" />
            <input
              type="text"
              placeholder="Имя"
              className="w-full pl-10 pr-4 py-2 border border-[#f5d0aa] rounded-full focus:outline-none focus:ring-2 focus:ring-[#d87b4a] text-sm bg-white"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FiMail className="absolute top-3 left-3 text-[#cba87d]" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2 border border-[#f5d0aa] rounded-full focus:outline-none focus:ring-2 focus:ring-[#d87b4a] text-sm bg-white"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FiLock className="absolute top-3 left-3 text-[#cba87d]" />
            <input
              type="password"
              placeholder="Пароль"
              className="w-full pl-10 pr-4 py-2 border border-[#f5d0aa] rounded-full focus:outline-none focus:ring-2 focus:ring-[#d87b4a] text-sm bg-white"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#d87b4a] text-white text-sm py-2 mt-2 rounded-full hover:bg-[#a04922] transition"
          >
            Зарегистрироваться
          </button>

          {/* Login Link */}
          <div className="text-center text-sm mt-6 text-[#5a3e2b]">
            <a href="/login" className="hover:underline">
              Уже есть аккаунт? Войти
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
