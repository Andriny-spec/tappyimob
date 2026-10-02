"use client";

import { useRouter } from "next/navigation";
import { RiMenuLine, RiLogoutBoxRLine, RiUserLine } from "react-icons/ri";
import { useAuth } from "@/providers/auth-provider";

interface Props {
  onOpenSidebar: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  CORRETOR: "Corretor",
  FOTOGRAFO: "Fotógrafo",
  SDR: "SDR",
  CLIENTE: "Cliente",
};

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  CORRETOR: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  FOTOGRAFO: "bg-purple-500/15 text-purple-300 border-purple-500/30",
};

export function UserTopbar({ onOpenSidebar }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  const role = user?.role ?? "";
  const badge = ROLE_BADGE[role] ?? "bg-white/10 text-white/60 border-white/10";

  return (
    <header className="fixed top-0 left-0 right-0 z-20 border-b border-white/5 bg-[#070f1c]/60 backdrop-blur-lg">
      <div className="h-14 px-3 sm:px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Abrir conversas"
          >
            <RiMenuLine className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-white font-bold tracking-tight truncate">
              Tappy{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #25D366 60%, #4ADE80 100%)" }}
              >
                IA
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm text-white/90 font-medium truncate max-w-[180px]">
                {user.name}
              </span>
              <span className="text-[11px] text-white/40 truncate max-w-[180px]">
                {user.email}
              </span>
            </div>
          )}
          {role && (
            <span
              className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${badge}`}
            >
              {ROLE_LABEL[role] ?? role}
            </span>
          )}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-[#25D366] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-orange-500/20">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : initials !== "?" ? (
              initials
            ) : (
              <RiUserLine className="w-4 h-4" />
            )}
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="w-9 h-9 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-white/60 hover:text-red-300"
            aria-label="Sair"
            title="Sair"
          >
            <RiLogoutBoxRLine className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
