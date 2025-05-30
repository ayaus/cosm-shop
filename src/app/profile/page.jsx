import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import ProfileClient from "../../../components/ProfileClient"; 

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const cookieStore = await cookies(); 
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return <div className="text-red-500">❌ Вы не вошли в систему</div>;
  }

  const res = await fetch("http://localhost:5002/api/user/profile", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return <div className="text-red-500">Ошибка профиля: {res.status}</div>;
  }

  const user = await res.json();

  return <ProfileClient user={user} token={token} />;
}
