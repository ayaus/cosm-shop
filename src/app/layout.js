import "./globals.css";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="bg-black text-white min-h-screen">
        <Navbar />           
        {children}           
        <ChatWidget />       
      </body>
    </html>
  );
}
