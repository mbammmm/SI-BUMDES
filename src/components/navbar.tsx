"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Building2,
  Factory,
  BookOpen,
  Wallet,
  FileText,
  Package,
  BarChart3,
  Mail,
  Archive,
  Users,
  Bell,
  PieChart,
  Menu,
  X,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  role: {
    name: string;
    permissions: Record<string, any>;
  };
};

const modulePermissions: Record<string, string> = {
  "/master/profil": "users",
  "/master/unit-usaha": "users",
  "/master/coa": "users",
  "/master/pengguna": "users",
  "/master/roles": "users",
  "/keuangan/transaksi": "accounting",
  "/keuangan/jurnal": "accounting",
  "/keuangan/laporan/neraca": "accounting",
  "/keuangan/laporan/laba-rugi": "accounting",
  "/keuangan/laporan/arus-kas": "accounting",
  "/keuangan/shu": "accounting",
  "/surat": "letters",
  "/arsip": "archives",
  "/aset": "assets",
  "/notifikasi": "notifications",
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      let authJson = null;

      for (let i = 0; i < 3; i++) {
        try {
          const authRes = await fetch("/api/auth/me");
          if (authRes.ok) {
            authJson = await authRes.json();
            if (authJson?.user) break;
          }
        } catch {
          // ignore and retry
        }

        if (i < 2) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      if (!mounted) return;

      try {
        const notifRes = await fetch("/api/notifikasi?unread=true");
        if (notifRes.ok) {
          const notifJson = await notifRes.json();
          setUnreadCount(notifJson.unreadCount || 0);
        }
      } catch {
        // ignore notification errors
      }

      setUser(authJson?.user || null);
      setReady(true);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const isLoginPage = pathname === "/login";

  function hasAccess(href: string): boolean {
    if (!user || !user.role?.permissions) return false;

    const moduleKey = modulePermissions[href];
    if (!moduleKey) return true;

    const level = user.role.permissions[moduleKey];
    if (!level) return false;

    const allowedLevels = ["read", "input", "upload", "approve", "approve_sign", "read_approve", "crud"];
    return allowedLevels.includes(String(level));
  }

  if (isLoginPage) return null;

  const menuItems = [
    { href: "/", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
    { href: "/master/profil", icon: <Building2 size={16} />, label: "Profil" },
    { href: "/master/unit-usaha", icon: <Factory size={16} />, label: "Unit Usaha" },
    { href: "/master/coa", icon: <BookOpen size={16} />, label: "COA" },
    { href: "/master/pengguna", icon: <Users size={16} />, label: "Pengguna" },
    { href: "/master/roles", icon: <Users size={16} />, label: "Peran" },
    { href: "/keuangan/transaksi", icon: <Wallet size={16} />, label: "Transaksi" },
    { href: "/keuangan/jurnal", icon: <FileText size={16} />, label: "Jurnal" },
    { href: "/keuangan/laporan/neraca", icon: <BarChart3 size={16} />, label: "Neraca" },
    { href: "/keuangan/laporan/laba-rugi", icon: <BarChart3 size={16} />, label: "Laba Rugi" },
    { href: "/keuangan/laporan/arus-kas", icon: <BarChart3 size={16} />, label: "Arus Kas" },
    { href: "/keuangan/shu", icon: <PieChart size={16} />, label: "SHU" },
    { href: "/surat", icon: <Mail size={16} />, label: "Surat" },
    { href: "/surat/template", icon: <FileText size={16} />, label: "Template Surat" },
    { href: "/arsip", icon: <Archive size={16} />, label: "Arsip" },
    { href: "/aset", icon: <Package size={16} />, label: "Aset" },
    { href: "/notifikasi", icon: <Bell size={16} />, label: "Notifikasi", badge: unreadCount },
  ];

  const visibleMenuItems = ready ? menuItems.filter((item) => hasAccess(item.href)) : menuItems;

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50">
      {/* Desktop navbar */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Logo BUMDes"
            className="h-8 w-auto"
          />
          <span className="font-semibold text-lg">SI-BUMDes Maju Langgeng</span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
            />
          ))}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1 text-sm hover:bg-primary/80 px-3 py-1.5 rounded transition ml-2"
            >
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </nav>

      {/* Mobile navbar with hamburger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Logo BUMDes"
            className="h-8 w-auto"
          />
          <span className="font-semibold text-lg">SI-BUMDes</span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded hover:bg-primary/80 transition"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-white/20 max-h-[70vh] overflow-y-auto">
          <div className="px-2 py-2 space-y-1">
            {visibleMenuItems.map((item) => (
              <MobileNavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                onClick={() => setMobileOpen(false)}
              />
            ))}
            <form action="/api/auth/logout" method="POST" className="-mx-2">
              <button
                type="submit"
                className="w-full flex items-center gap-3 text-sm hover:bg-primary/80 px-3 py-2.5 rounded transition"
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded transition relative ${
        isActive
          ? "bg-white/20 font-medium"
          : "hover:bg-primary/80"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
  badge,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 text-sm px-3 py-2.5 rounded transition relative ${
        isActive
          ? "bg-white/20 font-medium"
          : "hover:bg-primary/80"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}
