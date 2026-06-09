export const USER_ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  MARKETING: "marketing",
  USER: "user",
};

export function normalizeRole(userLike) {
  if (userLike?.isAdmin === true) {
    return USER_ROLES.ADMIN;
  }

  const role = userLike?.role;
  if (
    role === USER_ROLES.ADMIN ||
    role === USER_ROLES.EDITOR ||
    role === USER_ROLES.MARKETING ||
    role === USER_ROLES.USER
  ) {
    return role;
  }

  return USER_ROLES.USER;
}

export function isAdmin(userLike) {
  return normalizeRole(userLike) === USER_ROLES.ADMIN;
}

export function canEditCatalog(userLike) {
  const role = normalizeRole(userLike);
  return role === USER_ROLES.ADMIN || role === USER_ROLES.EDITOR;
}

export function canManageRoles(userLike) {
  return isAdmin(userLike);
}

export function canAccessMarketing(userLike) {
  if (canManageRoles(userLike)) {
    return true;
  }

  return normalizeRole(userLike) === USER_ROLES.MARKETING;
}

