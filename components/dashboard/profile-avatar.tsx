"use client";

import { useState } from "react";

import type { User } from "@/lib/types";

export function ProfileAvatar({ user, className = "" }: { user: Pick<User, "full_name" | "has_profile_photo">; className?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = user.has_profile_photo && !imageFailed;
  const initial = user.full_name.slice(0, 1).toUpperCase();

  return (
    <span className={`grid place-items-center overflow-hidden rounded-[32%] bg-twilight font-bold text-gold ${className}`}>
      {showImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/api/backend/auth/me/profile-photo"
          alt={`Foto de perfil de ${user.full_name}`}
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : initial}
    </span>
  );
}
