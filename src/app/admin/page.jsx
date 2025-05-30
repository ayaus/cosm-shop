"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import API from "@/lib/api";

export default function AdminEntryPage() {
  const router = useRouter();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      const token = Cookies.get("accessToken");
      if (!token) return router.push("/login");

      try {
        const res = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const role = res.data.role;
        if (role === "admin") router.push("/admin/products");
        else if (role === "superadmin") router.push("/admin/users");
        else router.push("/");
      } catch (err) {
        router.push("/login");
      }
    };

    checkRoleAndRedirect();
  }, [router]);

  return <p className="p-4">🔄 Проверка роли и перенаправление...</p>;
}
