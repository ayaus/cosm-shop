"use client";
import { useState } from "react";
import API from "../../lib/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { FiMail, FiLock } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      Cookies.set("accessToken", res.data.accessToken);
      alert("🎉 Успешный вход!");
      router.push("/profile");
    } catch (err) {
      alert("❌ Ошибка входа");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fffaf5] via-[#fceee4] to-[#f8e1d4]">
      <div className="bg-white/80 backdrop-blur-md w-full max-w-md p-8 rounded-xl shadow-lg border border-[#f5d0aa]">
        <h2 className="text-center text-2xl font-semibold text-[#5a3e2b] mb-6 tracking-wide">Войти</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Options */}
          <div className="flex items-center justify-between text-sm text-[#7a5c45]">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="accent-[#d87b4a]" />
              <span>Запомнить меня</span>
            </label>
            <a href="#" className="hover:underline">
              Забыли пароль?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#d87b4a] text-white text-sm py-2 mt-2 rounded-full hover:bg-[#a04922] transition"
          >
            ВОЙТИ
          </button>

          {/* Register */}
          <div className="text-center text-sm mt-6 text-[#5a3e2b]">
            <a href="/register" className="hover:underline">
              Нет аккаунта? Зарегистрироваться
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}