"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvatarUploader from "@/components/AvatarUploader";
import Cookies from "js-cookie";
import Image from "next/image";
import API from "@/lib/api";
import { User, Package, MapPin, Gift } from "lucide-react";

export default function ProfileClient() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", avatar: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const t = Cookies.get("accessToken");
    if (!t) return router.push("/login");

    setToken(t);
    API.get("/auth/me", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((res) => {
        setUser(res.data);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          avatar: res.data.avatar || "",
        });
      })
      .catch(() => router.push("/login"));
  }, []);

  useEffect(() => {
    if (!token) return;
    if (tab === "orders") {
      API.get("/orders", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setOrders(res.data));
    }
    if (tab === "addresses") {
      API.get("/addresses", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setAddresses(res.data));
    }
  }, [tab, token]);

  const handleLogout = () => {
    Cookies.remove("accessToken");
    router.push("/login");
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:5002/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Не удалось обновить профиль");
      setMessage("Профиль обновлён");
      setEditMode(false);
    } catch (err) {
      setMessage(`Ошибка: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Профиль", icon: <User size={18} /> },
    { id: "orders", label: "Заказы", icon: <Package size={18} /> },
    { id: "addresses", label: "Адреса", icon: <MapPin size={18} /> },
  ];

  const getStatusStyle = (status) => {
    const base = "text-xs font-semibold px-2 py-1 rounded inline-block w-fit";
    switch (status) {
      case "в пути":
        return `${base} bg-yellow-100 text-yellow-800`;
      case "доставлен":
        return `${base} bg-green-100 text-green-700`;
      case "отменён":
        return `${base} bg-red-100 text-red-700`;
      default:
        return `${base} bg-gray-100 text-gray-600`;
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10 text-[#a04922] font-medium">
        Загрузка профиля...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-white/80 backdrop-blur rounded-xl border border-[#f5d0aa] shadow-md">
      <div className="flex justify-around mb-6 border-b border-[#f5d0aa] pb-2">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-full ${
              tab === id
                ? "bg-[#f9e5d0] text-[#a04922]"
                : "text-[#5a3e2b] hover:bg-[#fceee4]"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="flex flex-col items-center space-y-6">
          <div className="w-28 h-28 relative rounded-full overflow-hidden border border-[#f5d0aa]">
            {form.avatar ? (
              <Image src={form.avatar} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#fdf1e5]">
                <User className="text-[#d8b5a5] w-12 h-12" />
              </div>
            )}
          </div>

          <AvatarUploader
            user={user}
            token={token}
            onUpload={async ({ ufsUrl }) => {
              setForm((f) => ({ ...f, avatar: ufsUrl }));
              try {
                const res = await fetch("http://localhost:5002/api/user/profile", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ ...form, avatar: ufsUrl }),
                });
                if (!res.ok) throw new Error("Не удалось сохранить аватар");
                setMessage("Аватар обновлён");
              } catch (err) {
                setMessage(`Ошибка: ${err.message}`);
              }
            }}
          />

          <div className="w-full bg-[#fdfaf4] border border-[#f5d0aa] rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7a5c45]">Бонусные баллы</p>
                <p className="text-xl font-semibold text-[#a04922]">
                  {user.loyaltyPoints ?? 0} pts
                </p>
              </div>
              <Gift className="w-6 h-6 text-[#d87b4a]" />
            </div>
          </div>

          {!editMode ? (
            <div className="text-center space-y-1">
              <h2 className="text-xl font-medium text-[#5a3e2b]">{form.name}</h2>
              <p className="text-[#7a5c45]">{form.email}</p>
              {user.phone && <p className="text-[#7a5c45]">{user.phone}</p>}
            </div>
          ) : (
            <div className="w-full space-y-3">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-[#f5d0aa] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#d87b4a]"
                placeholder="Имя"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#f5d0aa] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#d87b4a]"
                placeholder="Email"
              />
            </div>
          )}

          {message && <p className="text-sm text-center text-green-600 font-medium">{message}</p>}

          <div className="flex gap-3 mt-4">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-5 py-2 border border-[#f5d0aa] text-[#5a3e2b] rounded hover:bg-[#fceee4]"
                >
                  Редактировать
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 border border-red-400 text-red-500 rounded hover:bg-red-50"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-5 py-2 bg-[#d87b4a] text-white rounded hover:bg-[#a04922] disabled:opacity-50"
                >
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-5 py-2 border border-[#f5d0aa] text-[#5a3e2b] rounded hover:bg-[#fceee4]"
                >
                  Отмена
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-4 w-full">
          {orders.length === 0 ? (
            <p className="text-gray-500">У вас пока нет заказов.</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="p-4 bg-white/80 backdrop-blur border border-[#f5d0aa] rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-[#7a5c45] mb-1">Дата: {new Date(order.createdAt).toLocaleString()}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="rounded border"
                          />
                          <div>
                            <p className="text-sm font-medium">{item.product.name}</p>
                            <p className="text-xs text-[#5a3e2b]">× {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm mt-2">Адрес: {order.address || "не указан"}</p>
                  </div>
                  <span className={getStatusStyle(order.status)}>{order.status || "Ожидает"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "addresses" && (
        <div className="space-y-3 w-full">
          {addresses.length === 0 ? (
            <p className="text-gray-500">Нет сохранённых адресов.</p>
          ) : (
            addresses.map((addr) => (
              <div key={addr._id} className="p-4 border border-[#f5d0aa] rounded bg-white/80 backdrop-blur">
                <p className="text-sm font-medium">{addr.label}</p>
                <p className="text-sm text-[#5a3e2b]">{addr.details}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
