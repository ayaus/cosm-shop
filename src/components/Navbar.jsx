"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import API from "@/lib/api";
import { User, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const currentToken = Cookies.get("accessToken");
    if (!currentToken || currentToken === token) return;

    setToken(currentToken);

    API.get("/auth/me", {
      headers: { Authorization: `Bearer ${currentToken}` },
    })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
        Cookies.remove("accessToken");
      });
  }, [token, pathname]); 

  const handleLogout = () => {
    Cookies.remove("accessToken");
    setUser(null);
    router.push("/login");
  };

  const links = [
    { href: "/", label: "Главная" },
    { href: "/products", label: "Каталог" },
    { href: "/cart", label: "Корзина" },
  ];

  if (user?.role === "admin") {
    links.push({ href: "/admin/products", label: "Админ: Товары" });
  } else if (user?.role === "superadmin") {
    links.push({ href: "/admin/users", label: "Админ: Пользователи" });
  }

  return (
    <header className="bg-gradient-to-r from-[#fffaf5]/80 via-[#fceee4]/70 to-[#fff7f0]/80 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-[#f5d0aa]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2">
            <div className="text-xl font-extrabold tracking-wide text-[#d87b4a]">
              COSM <span className="text-[#5a3e2b]">SHOP</span>
            </div>
          </div>
        </Link>

        <nav>
          <ul className="flex gap-5 items-center">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-semibold px-3 py-1 rounded-md transition-all duration-200 ${
                    pathname === link.href
                      ? "bg-[#f9e5d0] text-[#a04922]"
                      : "text-[#5a3e2b] hover:text-[#d87b4a] hover:bg-[#fce9da]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {!user ? (
              <>
                <li>
                  <Link
                    href="/login"
                    className={`text-sm font-semibold px-3 py-1 rounded-md transition-all duration-200 ${
                      pathname === "/login"
                        ? "bg-[#f9e5d0] text-[#a04922]"
                        : "text-[#5a3e2b] hover:text-[#d87b4a] hover:bg-[#fce9da]"
                    }`}
                  >
                    Войти
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className={`text-sm font-semibold px-3 py-1 rounded-md transition-all duration-200 ${
                      pathname === "/register"
                        ? "bg-[#f9e5d0] text-[#a04922]"
                        : "text-[#5a3e2b] hover:text-[#d87b4a] hover:bg-[#fce9da]"
                    }`}
                  >
                    Регистрация
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/profile"
                    className="text-[#5a3e2b] hover:text-[#d87b4a] p-1.5 rounded-full transition"
                    title="Профиль"
                  >
                    <User size={20} strokeWidth={2} />
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    title="Выйти"
                    className="text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded-full border border-red-500 transition"
                  >
                    <LogOut size={20} strokeWidth={2} />
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
