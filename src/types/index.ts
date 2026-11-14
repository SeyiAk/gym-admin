import type { ReactNode } from "react";

/* ----------------------------------------------------------------------------
 * App-level types
 * -------------------------------------------------------------------------- */

export type LocalRoutes = {
  path: string;
  element: ReactNode;
  requiresAuth?: boolean;
  noLayout?: boolean;
  children?: LocalRoutes[];
};

export enum NotificationType {
  success = "success",
  error = "error",
  info = "info",
}

export type Notification = { message: string; type: NotificationType };

export type HeaderState = { route: string; title: string; subtitle?: string };

export type BaseSliceState = { message?: string; errorMessage?: string };

export type SharedState = BaseSliceState & {
  notification: Notification | null;
  header: HeaderState;
};

/* ----------------------------------------------------------------------------
 * API envelope — every endpoint returns { success, message, data }.
 * -------------------------------------------------------------------------- */

export type ApiResponse<T> = { success: boolean; message: string; data: T };

export type Pagination = { page: number; limit: number; total: number; totalPages: number };

export type ListParams = { page?: number; limit?: number; search?: string };

/** Org roles from the spec. MEMBER is a gym customer and has no dashboard access. */
export type OrgRole = "OWNER" | "GENERAL_MANAGER" | "MANAGER" | "RECEPTIONIST" | "MEMBER";

export type Scope = "branch" | "organization";

export type ScopeParams = { scope: Scope; branchId?: string };

/* ----------------------------------------------------------------------------
 * Auth
 * -------------------------------------------------------------------------- */

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  globalRole?: string;
  status?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt?: string;
};

export type AuthTokens = { accessToken: string; refreshToken: string };

export type LoginPayload = { identifier: string; password: string };
export type LoginResponse = AuthTokens & { user: User };

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

/** GET /mobile/organizations — the only endpoint that returns the user's role per organization. */
export type UserOrganization = {
  id: string;
  name: string;
  logo?: string | null;
  city?: string;
  state?: string;
  role: OrgRole;
  membershipStatus?: string;
  isActive: boolean;
};

export type AuthState = BaseSliceState & {
  user: User | null;
  organizations: UserOrganization[];
  activeOrganization: UserOrganization | null;
};

export type ScopeState = { branchId: string | null };

/* ----------------------------------------------------------------------------
 * Organization
 * -------------------------------------------------------------------------- */

export type Organization = {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  description?: string | null;
  logo?: string | null;
};

export type UpdateOrganizationPayload = Partial<Omit<Organization, "id">>;

/* ----------------------------------------------------------------------------
 * Dashboard overview
 * -------------------------------------------------------------------------- */

export type Metric<T = number> = { value: T; previousValue: T; percentageChange: number | null };

export type GrowthPeriod = "7d" | "30d" | "custom";

export type OverviewParams = ScopeParams & {
  growthPeriod?: GrowthPeriod;
  startDate?: string;
  endDate?: string;
};

export type Overview = {
  scope: { type: "BRANCH" | "ORGANIZATION"; organizationId: string; branchId: string | null };
  metrics: {
    totalMembers: Metric;
    activeMemberships: Metric;
    monthlyCheckIns: Metric;
    monthlyRevenue: Metric<string>;
  };
  membershipStatus: { active: number; expiringSoon: number; inactive: number };
  membershipGrowth: {
    period: GrowthPeriod;
    startDate: string;
    endDate: string;
    data: { date: string; activeMemberships: number }[];
  };
  // Item shapes are not documented; see utils/normalize.ts.
  upcomingRenewals: unknown[];
  recentActivities: unknown[];
};

/* ----------------------------------------------------------------------------
 * Members
 * -------------------------------------------------------------------------- */

export type MemberStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type MembersParams = ScopeParams & ListParams & { status?: MemberStatus };

export type BranchRef = { id: string; name: string; code?: string };

export type Member = {
  id: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  email?: string | null;
  phone: string;
  profileImage?: string | null;
  status: MemberStatus;
  joinedAt: string;
  homeBranch?: BranchRef | null;
  currentMembership?: {
    id: string;
    plan: { id: string; name: string };
    startDate: string;
    endDate: string;
    price: string;
    status: "ACTIVE";
  } | null;
};

export type MembersResponse = {
  scope: Overview["scope"];
  members: Member[];
  pagination: Pagination;
};

/* ----------------------------------------------------------------------------
 * Memberships
 * -------------------------------------------------------------------------- */

export type MembershipStatus = "PENDING" | "ACTIVE" | "EXPIRED" | "SUSPENDED" | "CANCELLED";

export type MembershipsParams = ScopeParams & ListParams & { status?: MembershipStatus };

/* ----------------------------------------------------------------------------
 * Membership plans
 * -------------------------------------------------------------------------- */

export type DurationUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

export type MembershipPlan = {
  id: string;
  branchId: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number;
  durationUnit: DurationUnit;
  gracePeriod: number;
  status: string;
  activeMembers: number;
  revenue: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePlanPayload = {
  branchId: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  durationUnit: DurationUnit;
  gracePeriod?: number;
};

export type UpdatePlanPayload = Partial<Omit<CreatePlanPayload, "branchId">>;

/* ----------------------------------------------------------------------------
 * Branches
 * -------------------------------------------------------------------------- */

export type CreateBranchPayload = {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  isPrimary?: boolean;
};

/* ----------------------------------------------------------------------------
 * Staff
 * -------------------------------------------------------------------------- */

export type InviteRole = "OWNER" | "MANAGER" | "RECEPTIONIST";

export type InviteStaffPayload = { email: string; role: InviteRole };

/* ----------------------------------------------------------------------------
 * Reports
 * -------------------------------------------------------------------------- */

export type ReportsParams = {
  period?: 3 | 6;
  startDate?: string;
  endDate?: string;
  branchId?: string;
};
