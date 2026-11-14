/**
 * Single source of truth for who sees what. Role rules come from the API spec's endpoint descriptions;
 * where the spec is silent (e.g. which roles hold VIEW_STAFF) the choice is noted inline.
 */
import type { OrgRole } from "@/types";

export const DASHBOARD_ROLES: OrgRole[] = ["OWNER", "GENERAL_MANAGER", "MANAGER", "RECEPTIONIST"];
/** Least-privileged dashboard role; used when the API returns a role we don't recognise. */
export const DEFAULT_ROLE: OrgRole = "RECEPTIONIST";

export const ROLE_LABELS: Record<OrgRole, string> = {
  OWNER: "Owner",
  GENERAL_MANAGER: "General Manager",
  MANAGER: "Manager",
  RECEPTIONIST: "Receptionist",
  MEMBER: "Member",
};

export const SIDEBAR_PATH_ORDER = [
  "/overview",
  "/members",
  "/memberships",
  "/membershipPlans",
  "/attendance",
  "/branches",
  "/staff",
  "/reports",
  "/settings",
] as const;

const ORG_ADMINS: OrgRole[] = ["OWNER", "GENERAL_MANAGER"];

const ACCESS_MAP: Record<OrgRole, string[]> = {
  OWNER: [...SIDEBAR_PATH_ORDER],
  GENERAL_MANAGER: [...SIDEBAR_PATH_ORDER],
  // Spec: /dashboard/branches is OWNER/GENERAL_MANAGER only. Staff access for MANAGER is assumed
  // (the spec only says "VIEW_STAFF permission").
  MANAGER: [
    "/overview",
    "/members",
    "/memberships",
    "/membershipPlans",
    "/attendance",
    "/staff",
    "/reports",
    "/settings",
  ],
  // Spec: reports allow RECEPTIONIST with a branch selected.
  RECEPTIONIST: [
    "/overview",
    "/members",
    "/memberships",
    "/membershipPlans",
    "/attendance",
    "/reports",
    "/settings",
  ],
  MEMBER: [],
};

export const normaliseRole = (role?: string | null): OrgRole => {
  if (role && role in ACCESS_MAP) return role as OrgRole;
  return DEFAULT_ROLE;
};

export const isDashboardRole = (role?: string | null) =>
  !!role && DASHBOARD_ROLES.includes(role as OrgRole);

export const getAllowedPaths = (role?: string | null) => ACCESS_MAP[normaliseRole(role)];

const governed = new Set(Object.values(ACCESS_MAP).flat());

/** Paths that appear in no role's list are ungoverned (e.g. /404) and always allowed. */
export function canAccessPath(role: string | null | undefined, pathname: string) {
  const base = "/" + (pathname.split("/")[1] ?? "");
  if (!governed.has(base)) return true;
  return getAllowedPaths(role).includes(base);
}

export function getLandingPath(role?: string | null) {
  const allowed = getAllowedPaths(role);
  return SIDEBAR_PATH_ORDER.find((p) => allowed.includes(p)) ?? "/settings";
}

/* Action-level checks. Components call these; they never compare role strings themselves. */

/** Organization-wide (all branches) data: OWNER and GENERAL_MANAGER only, per spec. */
export const canViewOrganizationScope = (role?: string | null) =>
  ORG_ADMINS.includes(normaliseRole(role));

/** Spec: only OWNER and GENERAL_MANAGER can create, update or deactivate plans. */
export const canManagePlans = (role?: string | null) => ORG_ADMINS.includes(normaliseRole(role));

/** Spec: CREATE_BRANCH is OWNER / GENERAL_MANAGER. */
export const canCreateBranch = (role?: string | null) => ORG_ADMINS.includes(normaliseRole(role));

/** Spec: QR generation is permission-gated; assumed to follow branch management. */
export const canGenerateBranchQr = (role?: string | null) =>
  ORG_ADMINS.includes(normaliseRole(role));

/** Spec: INVITE_STAFF permission. Assumed OWNER / GENERAL_MANAGER / MANAGER. */
export const canInviteStaff = (role?: string | null) =>
  ["OWNER", "GENERAL_MANAGER", "MANAGER"].includes(normaliseRole(role));

/** Spec: the invitation endpoint offers OWNER, MANAGER and RECEPTIONIST. Only owners invite owners. */
export const invitableRoles = (role?: string | null) =>
  normaliseRole(role) === "OWNER"
    ? (["OWNER", "MANAGER", "RECEPTIONIST"] as const)
    : (["MANAGER", "RECEPTIONIST"] as const);

/** Spec: PATCH /organizations/:id needs update permission; assumed OWNER / GENERAL_MANAGER. */
export const canEditOrganization = (role?: string | null) =>
  ORG_ADMINS.includes(normaliseRole(role));
