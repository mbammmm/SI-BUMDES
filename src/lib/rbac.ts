export type Permission =
  | "users:crud"
  | "users:read"
  | "accounting:crud"
  | "accounting:read_approve"
  | "accounting:input"
  | "accounting:read"
  | "assets:crud"
  | "assets:approve"
  | "assets:input"
  | "assets:read"
  | "letters:crud"
  | "letters:approve_sign"
  | "letters:input"
  | "letters:read"
  | "archives:crud"
  | "archives:upload"
  | "archives:read"
  | "reports:read";

export type Module =
  | "users"
  | "accounting"
  | "assets"
  | "letters"
  | "archives"
  | "reports";

export type PermissionLevel = "crud" | "read_approve" | "input" | "read" | "none" | "upload" | "approve" | "approve_sign";

const permissionMap: Record<string, string[]> = {
  users: ["users:crud", "users:read"],
  accounting: ["accounting:crud", "accounting:read_approve", "accounting:input", "accounting:read"],
  assets: ["assets:crud", "assets:approve", "assets:input", "assets:read"],
  letters: ["letters:crud", "letters:approve_sign", "letters:input", "letters:read"],
  archives: ["archives:crud", "archives:upload", "archives:read"],
  reports: ["reports:read"],
};

export function getPermissions(rolePermissions: Record<string, any>): string[] {
  const perms: string[] = [];
  for (const [module, level] of Object.entries(rolePermissions)) {
    const modulePerms = permissionMap[module] || [];
    const levelStr = String(level);
    if (levelStr === "crud") {
      perms.push(...modulePerms);
    } else if (levelStr === "read") {
      const readPerm = modulePerms.find((p) => p.endsWith(":read"));
      if (readPerm) perms.push(readPerm);
    } else if (levelStr === "input") {
      const inputPerm = modulePerms.find((p) => p.endsWith(":input"));
      const readPerm = modulePerms.find((p) => p.endsWith(":read"));
      if (inputPerm) perms.push(inputPerm);
      if (readPerm) perms.push(readPerm);
    } else if (levelStr === "approve") {
      const approvePerm = modulePerms.find((p) => p.endsWith(":approve"));
      const readPerm = modulePerms.find((p) => p.endsWith(":read"));
      if (approvePerm) perms.push(approvePerm);
      if (readPerm) perms.push(readPerm);
    } else if (levelStr === "approve_sign") {
      const approveSignPerm = modulePerms.find((p) => p.endsWith(":approve_sign"));
      const readPerm = modulePerms.find((p) => p.endsWith(":read"));
      if (approveSignPerm) perms.push(approveSignPerm);
      if (readPerm) perms.push(readPerm);
    } else if (levelStr === "upload") {
      const uploadPerm = modulePerms.find((p) => p.endsWith(":upload"));
      const readPerm = modulePerms.find((p) => p.endsWith(":read"));
      if (uploadPerm) perms.push(uploadPerm);
      if (readPerm) perms.push(readPerm);
    } else if (levelStr === "read_approve") {
      const readPerm = modulePerms.find((p) => p.endsWith(":read"));
      const approvePerm = modulePerms.find((p) => p.endsWith(":approve"));
      if (readPerm) perms.push(readPerm);
      if (approvePerm) perms.push(approvePerm);
    }
  }
  return perms;
}

export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  return userPermissions.includes(requiredPermission);
}

export function canAccess(
  userPermissions: string[],
  module: Module,
  minLevel: PermissionLevel
): boolean {
  const modulePerms = permissionMap[module] || [];
  const levelPriority: Record<PermissionLevel, number> = {
    none: 0,
    read: 1,
    upload: 2,
    input: 3,
    approve: 4,
    approve_sign: 5,
    read_approve: 6,
    crud: 7,
  };

  const requiredPriority = levelPriority[minLevel];

  for (const perm of userPermissions) {
    for (const modulePerm of modulePerms) {
      if (perm === modulePerm) {
        const permLevel = modulePerm.split(":")[1] as PermissionLevel;
        const permPriority = levelPriority[permLevel] || 0;
        if (permPriority >= requiredPriority) {
          return true;
        }
      }
    }
  }

  return false;
}
