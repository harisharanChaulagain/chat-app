"use client";

import { useLogout } from "@/hooks/useLogout";
import { useUserStore } from "@/store/userStore";
import { MessageCircle, Users, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useUserStore();

  const [openProfile, setOpenProfile] = useState(false);

  const { mutate: logout, isPending } = useLogout();

  return (
    <div className="h-screen w-16 bg-slate-900 flex flex-col justify-between items-center py-4 border-r border-slate-800">

      <div className="flex flex-col gap-6 items-center">

        <button
          onClick={() => router.push("/chats")}
          className={`p-2 rounded-lg hover:bg-slate-700 ${pathname.startsWith("/chats") ? "bg-slate-700" : ""
            }`}
        >
          <MessageCircle className="text-white" />
        </button>

        <button
          onClick={() => router.push("/friends")}
          className={`p-2 rounded-lg hover:bg-slate-700 ${pathname.startsWith("/friends") ? "bg-slate-700" : ""
            }`}
        >
          <Users className="text-white" />
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpenProfile(!openProfile)}
          className="p-2 rounded-full hover:bg-slate-700"
        >
          <User className="text-white" />
        </button>

        {openProfile && (
          <div className="absolute bottom-12 left-12 w-48 bg-slate-800 text-white rounded-lg shadow-lg p-3">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-slate-400 mb-2">{user?.email}</p>

            <button
              className="w-full text-left text-red-400 hover:text-red-300 text-sm"
              onClick={() => logout()}
              disabled={isPending}
            >
              {isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}