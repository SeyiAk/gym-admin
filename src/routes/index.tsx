import { lazy } from "react";
import { Navigate } from "react-router-dom";
import LoginIndex from "@/pages/auth/LoginIndex";
import type { LocalRoutes } from "@/types";

const ForgotPasswordIndex = lazy(() => import("@/pages/auth/ForgotPasswordIndex"));
const ResetPasswordIndex = lazy(() => import("@/pages/auth/ResetPasswordIndex"));
const OverviewIndex = lazy(() => import("@/pages/overview/OverviewIndex"));
const MembersOutlet = lazy(() => import("@/pages/members"));
const MembersIndex = lazy(() => import("@/pages/members/MembersIndex"));
const MemberDetailsIndex = lazy(() => import("@/pages/members/MemberDetailsIndex"));
const MembershipsIndex = lazy(() => import("@/pages/memberships/MembershipsIndex"));
const MembershipPlansIndex = lazy(() => import("@/pages/membershipPlans/MembershipPlansIndex"));
const AttendanceIndex = lazy(() => import("@/pages/attendance/AttendanceIndex"));
const BranchesIndex = lazy(() => import("@/pages/branches/BranchesIndex"));
const StaffIndex = lazy(() => import("@/pages/staff/StaffIndex"));
const ReportsIndex = lazy(() => import("@/pages/reports/ReportsIndex"));
const SettingsIndex = lazy(() => import("@/pages/settings/SettingsIndex"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export const routes: LocalRoutes[] = [
  { path: "/", element: <LoginIndex /> },
  { path: "/forgotPassword", element: <ForgotPasswordIndex /> },
  { path: "/resetPassword", element: <ResetPasswordIndex /> },
  { path: "/dashboard", element: <Navigate to="/overview" replace />, noLayout: true },
  { path: "/overview", element: <OverviewIndex />, requiresAuth: true },
  {
    path: "/members",
    element: <MembersOutlet />,
    requiresAuth: true,
    children: [
      { path: "", element: <MembersIndex /> },
      { path: ":id", element: <MemberDetailsIndex /> },
    ],
  },
  { path: "/memberships", element: <MembershipsIndex />, requiresAuth: true },
  { path: "/membershipPlans", element: <MembershipPlansIndex />, requiresAuth: true },
  { path: "/attendance", element: <AttendanceIndex />, requiresAuth: true },
  { path: "/branches", element: <BranchesIndex />, requiresAuth: true },
  { path: "/staff", element: <StaffIndex />, requiresAuth: true },
  { path: "/reports", element: <ReportsIndex />, requiresAuth: true },
  { path: "/settings", element: <SettingsIndex />, requiresAuth: true },
  { path: "*", element: <NotFound />, noLayout: true },
];
