"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Building2,
  Factory,
  Wallet,
  Mail,
  Archive,
  Package,
  Users,
  Bell,
  Menu,
  X,
  ChevronDown,
  Clock,
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
  "/": "",
  "/master/profil": "users",
  "/master/unit-usaha": "users",
  "/master/coa": "users",
  "/master/pengguna": "users",
  "/master/roles": "users",
  "/keuangan": "accounting",
  "/surat": "letters",
  "/arsip": "archives",
  "/aset": "assets",
  "/notifikasi": "notifications",
  "/audit-log": "users",
};

const menuGroups = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    href: "/",
    permissions: [],
  },
  {
    label: "Master Data",
    icon: <Building2 size={16} />,
    items: [
      { href: "/master/profil", label: "Profil", icon: <Building2 size={14} /> },
      { href: "/master/unit-usaha", label: "Unit Usaha", icon: <Factory size={14} /> },
      { href: "/master/coa", label: "COA", icon: <Archive size={14} /> },
      { href: "/master/pengguna", label: "Pengguna", icon: <Users size={14} /> },
      { href: "/master/roles", label: "Peran", icon: <Users size={14} /> },
    ],
  },
  {
    label: "Keuangan",
    icon: <Wallet size={16} />,
    items: [
      { href: "/keuangan/transaksi", label: "Transaksi" },
      { href: "/keuangan/jurnal", label: "Jurnal" },
      { href: "/keuangan/buku-besar", label: "Buku Besar" },
      { href: "/keuangan/neraca-salado", label: "Neraca Saldo" },
      { href: "/keuangan/laporan", label: "Laporan" },
      { href: "/keuangan/laporan/neraca", label: "Neraca" },
      { href: "/keuangan/laporan/laba-rugi", label: "Laba Rugi" },
      { href: "/keuangan/laporan/arus-kas", label: "Arus Kas" },
      { href: "/keuangan/shu", label: "SHU" },
    ],
  },
  {
    label: "Surat",
    icon: <Mail size={16} />,
    items: [
      { href: "/surat", label: "Surat" },
      { href: "/surat/template", label: "Template" },
    ],
  },
  {
    label: "Arsip",
    icon: <Archive size={16} />,
    href: "/arsip",
  },
  {
    label: "Aset",
    icon: <Package size={16} />,
    href: "/aset",
  },
  {
    label: "Notifikasi",
    icon: <Bell size={16} />,
    href: "/notifikasi",
    badge: true,
  },
  {
    label: "Audit Trail",
    icon: <Clock size={16} />,
    href: "/audit-log",
  },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState<string | null>(null);

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

  const visibleMenuGroups = ready
    ? menuGroups.filter((group) => {
        if (group.href) {
          return hasAccess(group.href);
        }
        return group.items!.some((item) => hasAccess(item.href));
      })
    : menuGroups;

  function isGroupActive(group: any) {
    if (group.href) return pathname === group.href;
    return group.items?.some((item: any) => pathname === item.href) || false;
  }

  function isItemActive(href: string) {
    return pathname === href;
  }

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

        <div className="flex items-center gap-1">
          {visibleMenuGroups.map((group) => {
            if (group.href) {
              return (
                <Link
                  key={group.label}
                  href={group.href}
                  className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded transition relative ${
                    isItemActive(group.href)
                      ? "bg-white/20 font-medium"
                      : "hover:bg-primary/80"
                  }`}
                >
                  {group.icon}
                  <span>{group.label}</span>
                  {group.badge && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                );
              }

              return (
                <div
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => setDesktopDropdownOpen(group.label)}
                  onMouseLeave={() => setTimeout(() => setDesktopDropdownOpen(null), 150)}
                >
                  <button
                    onClick={() => {
                      if (desktopDropdownOpen === group.label) {
                        setDesktopDropdownOpen(null);
                      } else {
                        setDesktopDropdownOpen(group.label);
                      }
                    }}
                    className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded transition ${
                      isGroupActive(group)
                        ? "bg-white/20 font-medium"
                        : "hover:bg-primary/80"
                    }`}
                  >
                    {group.icon}
                    <span>{group.label}</span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>

                  {desktopDropdownOpen === group.label && group.items && group.items.length > 0 && (
                    <div
                      className="absolute top-full left-0 mt-0.5 w-48 bg-white text-gray-900 rounded-lg shadow-lg border border-gray-200 py-1 z-50 transition-all duration-150"
                      onMouseEnter={() => setDesktopDropdownOpen(group.label)}
                      onMouseLeave={() => setTimeout(() => setDesktopDropdownOpen(null), 150)}
                    >
                      {group.items.filter((item) => hasAccess(item.href)).map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block px-3 py-2 text-sm hover:bg-gray-100 transition ${
                            isItemActive(item.href)
                              ? "bg-primary-50 text-primary font-medium"
                              : ""
                          }`}
                          onClick={() => setDesktopDropdownOpen(null)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

          <form action="/api/auth/logout" method="POST" className="ml-2">
            <button
              type="submit"
              className="flex items-center gap-1 text-sm hover:bg-primary/80 px-3 py-1.5 rounded transition"
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
            {visibleMenuGroups.map((group) => {
              if (group.href) {
                return (
                  <Link
                    key={group.label}
                    href={group.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 text-sm px-3 py-2.5 rounded transition relative ${
                      isItemActive(group.href)
                        ? "bg-white/20 font-medium"
                        : "hover:bg-primary/80"
                    }`}
                  >
                    {group.icon}
                    <span>{group.label}</span>
                    {group.badge && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              }

              return (
                <div key={group.label}>
                  <button
                    onClick={() => {
                      if (mobileDropdownOpen === group.label) {
                        setMobileDropdownOpen(null);
                      } else {
                        setMobileDropdownOpen(group.label);
                      }
                    }}
                    className={`w-full flex items-center justify-between gap-3 text-sm px-3 py-2.5 rounded transition ${
                      isGroupActive(group)
                        ? "bg-white/20 font-medium"
                        : "hover:bg-primary/80"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {group.icon}
                      {group.label}
                    </span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>

                  {mobileDropdownOpen === group.label && group.items && group.items.length > 0 && (
                    <div className="pl-6 pr-2 space-y-1">
                      {group.items.filter((item) => hasAccess(item.href)).map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            setMobileOpen(false);
                            setMobileDropdownOpen(null);
                          }}
                          className={`flex items-center gap-3 text-sm px-3 py-2 rounded transition ${
                            isItemActive(item.href)
                              ? "bg-white/20 font-medium"
                              : "hover:bg-primary/80"
                          }`}
                        >
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <form action="/api/auth/logout" method="POST" className="-mx-2">
              <button
                type="submit"
                className="w-full flex items-center gap-1 text-sm hover:bg-primary/80 px-3 py-2.5 rounded transition"
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
