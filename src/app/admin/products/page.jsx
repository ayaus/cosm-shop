"use client";

import { useEffect, useState } from "react";
import { UploadButton } from "@uploadthing/react";
import API from "@/lib/api";
import Cookies from "js-cookie";
import Image from "next/image";
import { Pencil, Trash, PackageSearch, ShoppingBag } from "lucide-react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", image: "", category: "" });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const token = Cookies.get("accessToken");

  useEffect(() => {
    if (tab === "products") loadProducts();
    if (tab === "orders") loadOrders();
  }, [tab]);

  const loadProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  const loadOrders = async () => {
    const res = await API.get("/orders/admin", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOrders(res.data);
  };

  const handleUpload = (res) => {
    if (res && res[0]?.ufsUrl) setForm((prev) => ({ ...prev, image: res[0].ufsUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) return alert("Загрузите изображение");

    const payload = { ...form, price: Number(form.price) };
    const headers = { headers: { Authorization: `Bearer ${token}` } };

    try {
      setUploading(true);
      editingId
        ? await API.put(`/products/${editingId}`, payload, headers)
        : await API.post("/products", payload, headers);
      alert(editingId ? "Обновлено" : "Добавлено");
      setForm({ name: "", description: "", price: "", image: "", category: "" });
      setEditingId(null);
      loadProducts();
    } catch {
      alert("Ошибка при сохранении");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category: p.category || "",
    });
    setEditingId(p._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Удалить товар?")) return;
    await API.delete(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadProducts();
  };

  const updateStatus = async (id, status) => {
    await API.patch(`/admin/orders/${id}`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadOrders();
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 text-[#5a3e2b]">
      {/* Табы */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${
            tab === "products" ? "bg-[#f9e5d0] text-[#a04922]" : "hover:bg-[#fceee4] border-[#f5d0aa]"
          }`}
        >
          <ShoppingBag size={16} /> Товары
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 ${
            tab === "orders" ? "bg-[#f9e5d0] text-[#a04922]" : "hover:bg-[#fceee4] border-[#f5d0aa]"
          }`}
        >
          <PackageSearch size={16} /> Заказы
        </button>
      </div>

      {/* Товары */}
      {tab === "products" && (
        <>
          <form onSubmit={handleSubmit} className="bg-[#fffaf6] border border-[#f5d0aa] rounded-xl p-5 space-y-3 shadow mb-10">
            <UploadButton endpoint="imageUploader" onClientUploadComplete={handleUpload} onUploadError={(e) => alert(e.message)} />
            {form.image && (
              <Image src={form.image} alt="preview" width={300} height={200} className="rounded border border-[#e6c6a2]" />
            )}
            <input type="text" placeholder="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputStyle} required />
            <input type="number" placeholder="Цена" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputStyle} required />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputStyle} required>
              <option value="">Категория</option>
              <option>Сыворотки</option>
              <option>Тонеры</option>
              <option>SPF</option>
              <option>Умывалки</option>
              <option>Кремы</option>
              <option>Тонер-Пэды</option>
            </select>
            <textarea placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputStyle} rows={3} required />
            <button type="submit" disabled={uploading} className="w-full py-2 bg-[#d87b4a] text-white rounded hover:bg-[#a04922] transition">
              {uploading ? "Сохраняем..." : editingId ? "Сохранить" : "Добавить товар"}
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p._id} className="border border-[#f5d0aa] bg-white/80 backdrop-blur p-4 rounded-xl shadow">
                <Image src={p.image} alt={p.name} width={300} height={200} className="rounded mb-2" />
                <h3 className="font-semibold text-[#5a3e2b] text-sm">{p.name}</h3>
                <p className="text-sm text-[#7a5c45]">{p.description}</p>
                <p className="text-sm text-[#a04922] font-bold mt-1">{p.price} ₸</p>
                <div className="flex justify-between mt-3 text-sm">
                  <button onClick={() => handleEdit(p)} className="flex items-center gap-1 text-[#5a3e2b] hover:text-[#d87b4a]">
                    <Pencil size={16} /> Редактировать
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="flex items-center gap-1 text-red-500 hover:text-red-700">
                    <Trash size={16} /> Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Заказы */}
      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-gray-500">Нет заказов.</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="p-4 border border-[#f5d0aa] rounded bg-white/80 backdrop-blur">
                <p className="text-sm text-[#7a5c45] mb-2">Дата: {new Date(order.createdAt).toLocaleString()}</p>
                <div className="space-y-1 mb-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="text-sm flex gap-2 items-center">
                      <Image src={item.product.image} alt={item.product.name} width={50} height={50} className="rounded border" />
                      <div className="flex-1">
                        <p>{item.product.name}</p>
                        <p className="text-xs text-[#5a3e2b]">× {item.quantity}</p>
                      </div>
                      <select
                        value={order.status || "Ожидает"}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="px-2 py-1 text-sm border border-[#f5d0aa] rounded bg-white ml-auto"
                      >
                        <option value="Ожидает">Ожидает</option>
                        <option value="В пути">В пути</option>
                        <option value="Доставлен">Доставлен</option>
                        <option value="Отменён">Отменён</option>
                      </select>
                    </div>
                  ))}
                </div>
                <p className="text-sm">Адрес: {order.address}</p>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}

const inputStyle = "w-full p-2.5 text-sm border border-[#e6c6a2] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#d87b4a] placeholder:text-[#a78d73]";
