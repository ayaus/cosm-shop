"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const categories = ["Все", "Сыворотки", "Кремы", "SPF", "Тонеры", "Умывалки", "Тонер-Пэды"];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get("/products");
        setProducts(response.data);
        setFiltered(response.data);
      } catch (err) {
        console.error("Ошибка загрузки товаров:", err);
        alert("Не удалось загрузить товары");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filter = (category, keyword) => {
    let result = products;
    if (category !== "Все") {
      result = result.filter((p) => p.category === category);
    }
    if (keyword.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    setFiltered(result);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    filter(cat, search);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    filter(activeCategory, value);
  };

  const addToCart = async (productId) => {
    try {
      const token = Cookies.get("accessToken");
      if (!token) {
        alert("Для добавления в корзину необходимо авторизоваться");
        router.push("/login");
        return;
      }

      const response = await API.post(
        "/cart",
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        alert("✅ Товар успешно добавлен в корзину");
      } else {
        alert(`❌ ${response.data.message || "Неизвестная ошибка"}`);
      }
    } catch (err) {
      console.error("Ошибка добавления в корзину:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Ошибка при добавлении в корзину";
      alert(`❌ ${errorMessage}`);

      if (err.response?.status === 401) {
        router.push("/login");
      }
    }
  };

  return (
    <main className="p-4 max-w-7xl mx-auto text-[#5a3e2b]">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Каталог товаров</h1>

      {/* Поиск */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-xl">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#cba87d] text-lg" />
          <input
            type="text"
            placeholder="Найти товар по названию или категории..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-2 text-sm border border-[#f0d1ac] rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d87b4a] focus:border-[#d87b4a] bg-white/80 backdrop-blur transition"
          />
        </div>
      </div>

      {/* Категории */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-3 py-1.5 text-xs rounded-full border transition font-medium ${
              activeCategory === cat
                ? "bg-[#d87b4a] text-white"
                : "bg-white/80 text-[#5a3e2b] border-[#f5d0aa] hover:bg-[#fceee4]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Список товаров */}
      {loading ? (
        <p className="text-center text-[#5a3e2b]">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400">Ничего не найдено.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div
              key={product._id}
              className="border border-[#f5d0aa] rounded-xl p-4 shadow-sm hover:shadow-lg transition bg-white/80 backdrop-blur"
            >
              <div className="w-full h-[200px] flex items-center justify-center bg-white rounded overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={200}
                  height={100}
                  className="object-contain"
                />
              </div>
              <h2 className="text-sm font-semibold mt-3 line-clamp-1">{product.name}</h2>
              <p className="text-xs text-[#7a5c45] line-clamp-2">{product.description}</p>
              <p className="text-sm font-bold text-[#a04922] mt-2">{product.price} ₸</p>
              <button
                onClick={() => addToCart(product._id)}
                className="mt-3 w-full px-3 py-2 text-xs bg-[#d87b4a] text-white rounded-full hover:bg-[#a04922] transition font-semibold"
              >
                Добавить в корзину
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
