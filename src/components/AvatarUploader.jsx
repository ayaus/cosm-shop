"use client";

import { UploadButton } from "@uploadthing/react";
import axios from "axios";

export default function AvatarUploader({ token, onUpload }) {
  const handleUpload = async (res) => {
    const url = res[0]?.ufsUrl;
    if (!url) return alert("Не удалось получить URL от UploadThing");

    try {
      await axios.put(
        "http://localhost:5002/api/user/profile",
        { avatar: url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onUpload({ ufsUrl: url });
    } catch (err) {
      alert("❌ Ошибка обновления профиля: " + err.message);
    }
  };

  return (
    <div className="mt-2">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={handleUpload}
        onUploadError={(e) => alert(`Ошибка загрузки: ${e.message}`)}
      />
    </div>
  );
}
