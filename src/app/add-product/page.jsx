'use client';

import { useEffect, useState, Suspense } from "react";
import { UploadButton } from "@uploadthing/react";
import API from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function AddOrEditProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const isEdit = Boolean(productId);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const { data } = await API.get(`/products/${productId}`);
          setForm({
            name: data.name,
            description: data.description,
            price: data.price,
            image: data.image,
            category: data.category || "",
          });
        } catch (err) {
          alert("Ошибка загрузки товара");
        }
      };
      fetchProduct();
    }
  }, [productId, isEdit]);

  const handleUpload = (res) => {
    if (res && res[0]?.ufsUrl) {
      setForm((prev) => ({ ...prev, image: res[0].ufsUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) return alert("Сначала загрузите изображение");

    try {
      setUploading(true);
      const payload = { ...form, price: Number(form.price) };

      if (isEdit) {
        await API.put(`/products/${productId}`, payload);
        alert("✅ Товар обновлён");
      } else {
        await API.post("/products", payload);
        alert("✅ Товар добавлен");
      }
      router.push("/products");
    } catch (err) {
      alert("❌ Ошибка при сохранении товара");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6 bg-white shadow rounded-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isEdit ? "Редактировать товар" : "Добавление товара"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Изображение товара</label>
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={handleUpload}
            onUploadError={(error) => alert("Ошибка загрузки: " + error.message)}
          />
          {form.image && (
            <div className="w-full h-64 relative mt-4 border rounded overflow-hidden">
              <Image
                src={form.image}
                alt="preview"
                fill
                className="object-cover"
                sizes="100%"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Название</label>
          <input
            type="text"
            placeholder="Введите название товара"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Категория</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
          >
            <option value="">Выберите категорию</option>
            <option value="тонеры">Тонеры</option>
            <option value="сыворотки">Сыворотки</option>
            <option value="кремы">Кремы</option>
            <option value="маски">Маски</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Описание</label>
          <textarea
            placeholder="Описание товара..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Цена (₸)</label>
          <input
            type="number"
            placeholder="Цена в тенге"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-black text-white font-medium py-2 px-4 rounded hover:bg-black transition"
        >
          {uploading ? (isEdit ? "Сохранение..." : "Добавление...") : isEdit ? "Сохранить изменения" : "Добавить товар"}
        </button>
      </form>
    </main>
  );
}

export default function AddOrEditProductPage() {
  return (
    <Suspense fallback={<div className="text-center">Загрузка...</div>}>
      <AddOrEditProductContent />
    </Suspense>
  );
}
