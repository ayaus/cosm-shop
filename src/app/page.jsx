"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import ChatWidget from "../../components/ChatWidget";

const sliderImages = [
  {
    url: "https://www.skin1004.com/cdn/shop/files/BRAND_MAIN.png?v=1748087626",
    title: "Новая линейка ухода от SKIN1004",
    subtitle: "Мощное восстановление и защита кожного барьера",
    buttonText: "Открыть коллекцию",
    buttonLink: "/products",
  },
  {
    url: "https://pureseoul.co.uk/cdn/shop/collections/Round-lab-korean-skincare-brand-at-PURESEOUL-The-Uks-Best-K-Beauty-Shop-HEADER.webp?v=1705679318",
    title: "Сияй каждый день",
    subtitle: "Легендарная линейка Round Lab с тонкой текстурой",
    buttonText: "Смотреть средства",
    buttonLink: "/products",
  },
  {
    url: "https://pretties.com.hk/cdn/shop/collections/celimax_Banner_prettieshk_1800x600_81782799-2a9d-436f-bad1-853dc95d139b_1890x630.png?v=1715069966",
    title: "Лучшие предложения недели",
    subtitle: "Скидки до 30% на любимые продукты Celimax",
    buttonText: "В магазин",
    buttonLink: "/products",
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [products, setProducts] = useState([]);
  const timeoutRef = useRef();

  const pauseAutoSlide = () => {
    setPaused(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPaused(false), 10000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!paused) {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    API.get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Ошибка загрузки товаров:", err));
  }, []);

  const nextSlide = () => {
    pauseAutoSlide();
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    pauseAutoSlide();
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const getRandomProducts = (count = 4) => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#fffaf5] via-[#fceee4] to-[#f8e1d4] text-[#5a3e2b] scroll-smooth">
      {/* === SLIDER === */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-[1200ms] ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}vw)` }}
        >
          {sliderImages.map((slide, index) => (
            <div key={index} className="w-screen h-[600px] relative flex-shrink-0">
              <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-6">
                <h2 className="text-4xl sm:text-6xl font-semibold drop-shadow-xl mb-4">{slide.title}</h2>
                <p className="text-lg sm:text-xl text-gray-200 mb-6 max-w-2xl">{slide.subtitle}</p>
                <a
                  href={slide.buttonLink}
                  className="inline-flex items-center gap-2 bg-white text-[#5a3e2b] font-medium px-6 py-2 rounded-full shadow-md hover:scale-105 hover:bg-[#f0e2d4] transition"
                >
                  {slide.buttonText}
                  <span className="text-xl">→</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-110 transition">
          ◀
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-110 transition">
          ▶
        </button>

        <div className="absolute bottom-5 w-full flex justify-center gap-3">
          {sliderImages.map((_, i) => (
            <div
              key={i}
              onClick={() => {
                pauseAutoSlide();
                setCurrentSlide(i);
              }}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                i === currentSlide ? "bg-[#d87b4a] scale-110" : "bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* === ХИТЫ ПРОДАЖ === */}
      <Section title="Хиты продаж">
        {getRandomProducts(4).map((item) => (
          <ProductCard key={item._id} item={item} />
        ))}
      </Section>

      {/* === МИНИ-БАННЕРЫ === */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 grid-rows-2 gap-6 h-[600px] sm:h-[400px]">
          <MiniBanner
            href="/products?type=комби"
            img="https://www.axis-y.com/cdn/shop/collections/AXIS-Y_image_08_5.jpg?v=1637913899"
            text="Топ для комбинированной кожи"
            className="col-span-1 sm:col-span-2 row-span-2"
          />
          <MiniBanner
            href="/products?category=тоники"
            img="https://koreanskincare.nl/cdn/shop/files/327474399_711489453909355_7644949443920367018_n_7ddb4063-e449-43d9-97c3-92431f4192f4.jpg?v=1712751671"
            text="Очищение и тонизирование"
          />
          <MiniBanner
            href="/products?tag=сыворотка"
            img="https://cdn11.bigcommerce.com/s-hwo2s3k4l6/images/stencil/1280x1280/products/589/2879/Round_Lab_Vita_Niacinamide_Dark_Spot_Serum_30_mL_KBeauty_Australia_-_aesthetic_photo_3__35174.1730067056.jpg?c=2"
            text="Сыворотки недели"
          />
        </div>
      </section>

      {/* === НОВИНКИ === */}
      <Section title="Новинки">
        {getRandomProducts(4).map((item) => (
          <ProductCard key={item._id} item={item} />
        ))}
      </Section>

      <ChatWidget />
    </div>
  );
}

// ==== COMPONENTS ====

function Section({ title, children }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-semibold text-center mb-8 text-[#5a3e2b]">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">{children}</div>
    </section>
  );
}

function ProductCard({ item }) {
  const router = useRouter();

  const handleBuy = async () => {
    try {
      await API.post("/cart", {
        productId: item._id,
        quantity: 1,
      });
      router.push("/cart");
    } catch (err) {
      alert("Ошибка при добавлении в корзину");
    }
  };

  return (
    <div className="border border-[#f5d0aa] rounded-xl p-4 shadow-sm hover:shadow-lg transition bg-white/80 text-center backdrop-blur group">
      <img src={item.image} alt={item.name} className="mx-auto object-contain h-[220px] w-full rounded-lg group-hover:scale-105 transition" />
      <h3 className="text-base mt-4 font-semibold text-[#5a3e2b]">{item.name}</h3>
      <p className="text-lg text-[#a04922] font-bold mt-1">{item.price} ₸</p>
      <button
        onClick={handleBuy}
        className="mt-4 bg-[#d87b4a] text-white text-sm py-2 px-6 rounded-full hover:bg-[#a35b2a] transition-all duration-300 shadow-md"
      >
        Купить
      </button>
    </div>
  );
}

function MiniBanner({ href, img, text, className = "" }) {
  return (
    <a href={href} className={`relative rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition ${className}`}>
      <img src={img} alt={text} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
      <div className="absolute inset-0 bg-[#00000033] flex items-center justify-center text-white text-sm sm:text-base font-semibold backdrop-blur-sm group-hover:bg-[#00000055] transition">
        {text}
      </div>
    </a>
  );
}
