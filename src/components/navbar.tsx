"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, Building2, Factory, BookOpen, Wallet, FileText, Package, BarChart3, Mail, Archive, Users } from "lucide-react";

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
  "/surat": "letters",
  "/arsip": "archives",
  "/aset": "assets",
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginPage, setIsLoginPage] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      setIsLoginPage(path === "/login");
    }

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        setUser(json.user);
        setLoading(false);
      });
  }, []);

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
    { href: "/surat", icon: <Mail size={16} />, label: "Surat" },
    { href: "/arsip", icon: <Archive size={16} />, label: "Arsip" },
    { href: "/aset", icon: <Package size={16} />, label: "Aset" },
  ];

  return (
    <nav className="bg-primary text-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Logo BUMDes"
            className="h-8 w-auto"
          />
          <span className="font-semibold text-lg hidden sm:block">
            SI-BUMDes Maju Langgeng
          </span>
        </div>

        <div className="flex items-center gap-1">
          {menuItems.map((item) => {
            if (!hasAccess(item.href)) return null;
            return (
              <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
            );
          })}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1 text-sm hover:bg-primary/80 px-3 py-1.5 rounded transition ml-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 text-sm hover:bg-primary/80 px-3 py-1.5 rounded transition"
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
}
