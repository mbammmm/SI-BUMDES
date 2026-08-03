"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPermissions, canAccess, hasPermission, type Module, type PermissionLevel, type Permission } from "@/lib/rbac";

type User = {
  id: string;
  name: string;
  role?: {
    name: string;
    permissions: Record<string, any>;
  };
};

type UsePermissionOptions = {
  module: Module;
  minLevel: PermissionLevel;
  redirectTo?: string;
};

export function usePermission({ module, minLevel, redirectTo = "/" }: UsePermissionOptions) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        setUser(json.user || null);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const userPermissions = user?.role?.permissions ? getPermissions(user.role.permissions) : [];
  const allowed = canAccess(userPermissions, module, minLevel);

  const writePermissions: string[] = [
    `${module}:input`,
    `${module}:crud`,
    `${module}:approve`,
    `${module}:approve_sign`,
    `${module}:read_approve`,
    `${module}:upload`,
  ];
  const canWrite = writePermissions.some((p) => hasPermission(userPermissions, p));

  useEffect(() => {
    if (!loading && !allowed) {
      router.replace(redirectTo);
    }
  }, [loading, allowed, router, redirectTo]);

  return { user, loading, allowed, canWrite };
}
