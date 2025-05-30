"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import API from "@/lib/api";
import Cookies from "js-cookie";
import { ShoppingCart, CreditCard, Gift, X, Plus, Minus } from "lucide-react";

const isValidCardNumber = (number) => /^[0-9]{16}$/.test(number.replaceAll(" ", ""));
const isValidExpiry = (value) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
const isValidCVV = (cvv) => /^[0-9]{3,4}$/.test(cvv);
const formatCardNumber = (number) => number.replace(/[^\d]/g, "").replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (value) => {
  const raw = value.replace(/[^\d]/g, "").slice(0, 4);
  if (raw.length < 3) return raw;
  return `${raw.slice(0, 2)}/${raw.slice(2)}`;
};

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = Cookies.get("accessToken");
        if (!token) return;

        const response = await API.get("/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const items = response.data?.products || [];
        const formatted = items.map((item) => ({
          id: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          image: item.productId.image,
          quantity: item.quantity,
        }));

        setCart(formatted);
      } catch (err) {
        console.error("Ошибка загрузки корзины:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await API.get("/products");
        setAllProducts(res.data);
      } catch (err) {
        console.error("Ошибка загрузки каталога:", err);
      }
    };
    fetchAllProducts();
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const removeFromCart = async (productId) => {
    try {
      const token = Cookies.get("accessToken");
      await API.post("/cart/remove", { productId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart((prev) => prev.filter((item) => item.id !== productId));
    } catch (err) {
      console.error("Ошибка при удалении товара:", err);
    }
  };

  const changeQty = async (productId, delta) => {
    try {
      const token = Cookies.get("accessToken");
      await API.patch(`/cart/${productId}`, { quantityDelta: delta }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + delta } : item
        ).filter((item) => item.quantity > 0)
      );
    } catch (err) {
      console.error("Ошибка изменения количества:", err);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!isValidCardNumber(cardNumber)) newErrors.cardNumber = "Введите корректный номер карты (16 цифр)";
    if (!isValidExpiry(expiry)) newErrors.expiry = "Введите срок в формате ММ/ГГ";
    if (!isValidCVV(cvv)) newErrors.cvv = "Введите корректный CVV";
    if (deliveryType === "delivery" && !address.trim()) newErrors.address = "Введите адрес доставки";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = Cookies.get("accessToken");
      await API.post("/orders", {
        items: cart.map((item) => ({ product: item.id, quantity: item.quantity })),
        address: deliveryType === "delivery" ? address : "Самовывоз",
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Оплата прошла успешно");
      setCart([]);
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setAddress("");
      setIsModalOpen(false);
    } catch (err) {
      alert("Ошибка при оплате");
      console.error(err);
    }
  };

  return (
    <main className="p-6 max-w-6xl mx-auto text-[#5a3e2b]">
      <div className="flex items-center justify-center gap-2 mb-6">
        <ShoppingCart className="w-6 h-6 text-[#d87b4a]" />
        <h1 className="text-2xl font-semibold text-center">Корзина</h1>
      </div>

      {loading ? (
        <p className="text-center">Загрузка...</p>
      ) : cart.length === 0 ? (
        <p className="text-center text-gray-400">Корзина пуста</p>
      ) : (
        <>
          <ul className="space-y-4 mb-8">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-28 h-28 rounded overflow-hidden">
                  <Image src={item.image} alt={item.name} width={112} height={112} className="object-contain w-full h-full" />
                </div>
                <div className="flex-1">
                  <h2 className="font-medium text-sm mb-1">{item.name}</h2>
                  <p className="text-[#a04922] text-sm font-semibold">{item.price} ₸</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => changeQty(item.id, -1)} className="bg-[#f9dbbe] p-1 rounded"><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => changeQty(item.id, 1)} className="bg-[#f9dbbe] p-1 rounded"><Plus size={14} /></button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)}>
                  <X className="w-5 h-5 text-red-500" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center mb-8">
            <span className="text-lg font-semibold">Итого: {total} ₸</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#d87b4a] text-white px-5 py-2 rounded-full hover:bg-[#a04922] flex items-center gap-2 transition"
            >
              <CreditCard className="w-5 h-5" /> Оплатить
            </button>
          </div>
        </>
      )}

      {cart.length > 0 && allProducts.length > 0 && (
        <div className="mt-12">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-[#d87b4a]" />
            <h2 className="text-lg font-semibold text-center">Рекомендуем вам</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {allProducts.sort(() => 0.5 - Math.random()).slice(0, 4).map((product) => (
              <div key={product._id} className="border border-[#f5d0aa] rounded-xl p-4 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition">
                <div className="w-full h-50 flex items-center justify-center rounded overflow-hidden">
                  <Image src={product.image} alt={product.name} width={200} height={100} className="object-contain" />
                </div>
                <h3 className="text-sm font-medium mt-2">{product.name}</h3>
                <p className="text-xs text-[#7a5c45]">{product.price} ₸</p>
                <button
                  onClick={async () => {
                    try {
                      const token = Cookies.get("accessToken");
                      await API.post("/cart", { productId: product._id }, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      alert("Товар добавлен в корзину!");
                    } catch {
                      alert("Ошибка при добавлении");
                    }
                  }}
                  className="mt-2 text-xs bg-[#d87b4a] text-white px-3 py-1.5 rounded-full w-full hover:bg-[#a04922] transition"
                >
                  В корзину
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-full max-w-md">
            <form onSubmit={handlePayment} className="space-y-4">
              <input type="text" placeholder="Номер карты" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} className="w-full border px-3 py-2 rounded" />
              {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}

              <div className="flex gap-2">
                <input type="text" placeholder="MM/ГГ" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} className="w-1/2 border px-3 py-2 rounded" />
                <input type="text" placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} className="w-1/2 border px-3 py-2 rounded" />
              </div>
              {errors.expiry && <p className="text-red-500 text-sm">{errors.expiry}</p>}
              {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}

              <select className="w-full border px-3 py-2 rounded" value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
                <option value="pickup">Самовывоз</option>
                <option value="delivery">Доставка</option>
              </select>

              {deliveryType === "delivery" && (
                <>
                  <input type="text" placeholder="Адрес доставки" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border px-3 py-2 rounded" />
                  {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                </>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Отмена</button>
                <button type="submit" className="px-4 py-2 bg-[#d87b4a] text-white rounded hover:bg-[#a04922]">Оплатить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}