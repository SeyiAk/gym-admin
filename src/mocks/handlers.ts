import { delay, http, HttpResponse } from "msw";
import * as db from "./data";

const ok = <T>(data: T, message = "OK") => HttpResponse.json({ success: true, message, data });

function paginate<T>(items: T[], url: URL) {
  const page = Number(url.searchParams.get("page") ?? 1);
  const limit = Number(url.searchParams.get("limit") ?? 20);
  return {
    items: items.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
}

const matches = (q: string | null, ...fields: (string | null | undefined)[]) =>
  !q || fields.some((f) => f?.toLowerCase().includes(q.toLowerCase()));

const base = "*/v1";

export const handlers = [
  http.post(`${base}/auth/login`, async () => {
    await delay(400);
    return ok(
      { user: db.user, accessToken: db.fakeJwt(1), refreshToken: db.fakeJwt(24 * 7) },
      "Login successful",
    );
  }),
  http.post(`${base}/auth/refresh-token`, () =>
    ok({ accessToken: db.fakeJwt(1), refreshToken: db.fakeJwt(24 * 7) }),
  ),
  http.post(`${base}/auth/logout`, () => ok(null, "logout successful")),
  http.post(`${base}/auth/forgot-password`, () =>
    ok({ sent: true }, "If the email exists, a password reset OTP has been sent."),
  ),
  http.post(`${base}/auth/reset-password`, () =>
    ok({ message: "Password reset successfully." }, "Password reset successfully."),
  ),
  http.get(`${base}/auth/me`, () => ok(db.user)),
  http.get(`${base}/mobile/organizations`, () => {
    const active = sessionStorage.getItem("mock:activeOrg") ?? "org1";
    return ok(db.organizations.map((o) => ({ ...o, isActive: o.id === active })));
  }),
  http.patch(`${base}/mobile/organizations/:id/select`, ({ params }) => {
    // Survive reloads so the role switch can be exercised end to end.
    sessionStorage.setItem("mock:activeOrg", String(params.id));
    return ok(null, "Active organization updated successfully.");
  }),
  http.patch(`${base}/mobile/profile/change-password`, () =>
    ok(null, "Password changed successfully."),
  ),
  http.get(`${base}/organizations/:id`, () => ok(db.organization)),
  http.patch(`${base}/organizations/:id`, async ({ request }) =>
    ok(
      { ...db.organization, ...((await request.json()) as object) },
      "Organization updated successfully",
    ),
  ),

  http.get(`${base}/dashboard/overview`, async ({ request }) => {
    await delay(300);
    const u = new URL(request.url);
    return ok(
      db.overview(
        u.searchParams.get("growthPeriod") ?? "30d",
        u.searchParams.get("startDate") ?? undefined,
        u.searchParams.get("endDate") ?? undefined,
      ),
    );
  }),
  http.get(`${base}/dashboard/members`, async ({ request }) => {
    await delay(300);
    const u = new URL(request.url);
    const q = u.searchParams.get("search");
    const status = u.searchParams.get("status");
    const branchId = u.searchParams.get("branchId");
    const list = db.members.filter(
      (m) =>
        matches(q, m.firstName, m.lastName, m.email, m.phone, m.membershipNumber) &&
        (!status || m.status === status) &&
        (!branchId || m.homeBranch.id === branchId),
    );
    const { items, pagination } = paginate(list, u);
    return ok({
      scope: { type: branchId ? "BRANCH" : "ORGANIZATION", organizationId: "org1", branchId },
      members: items,
      pagination,
    });
  }),
  http.get(`${base}/dashboard/members/:id`, ({ params }) =>
    ok(db.memberDetails(String(params.id))),
  ),
  http.get(`${base}/dashboard/memberships`, async ({ request }) => {
    await delay(300);
    const u = new URL(request.url);
    const status = u.searchParams.get("status");
    const { items, pagination } = paginate(
      db.memberships.filter((m) => !status || m.status === status),
      u,
    );
    return ok({
      summary: {
        totalMemberships: { value: 986, percentageChange: 8 },
        activeMemberships: { value: 842, percentageChange: 5 },
        expiredMemberships: { value: 102, percentageChange: -3 },
        monthlyRevenue: { value: "8460000.00", percentageChange: 10 },
      },
      memberships: items,
      pagination,
    });
  }),
  http.get(`${base}/membership-plans/branch/:branchId`, () => ok(db.plans)),
  http.post(`${base}/membership-plans`, async ({ request }) =>
    ok(
      { id: "new", ...((await request.json()) as object) },
      "Membership plan created successfully",
    ),
  ),
  http.patch(`${base}/membership-plans/:id/deactivate`, () =>
    ok(null, "Membership plan deactivated successfully"),
  ),
  http.patch(`${base}/membership-plans/:id`, async ({ request }) =>
    ok((await request.json()) as object, "Membership plan updated successfully"),
  ),
  http.get(`${base}/dashboard/branches`, async ({ request }) => {
    const u = new URL(request.url);
    const q = u.searchParams.get("search");
    const { items, pagination } = paginate(
      db.branches.filter((b) => matches(q, b.name, b.code, b.city, b.state)),
      u,
    );
    return ok({ branches: items, pagination });
  }),
  http.post(`${base}/dashboard/branches`, async ({ request }) =>
    ok((await request.json()) as object, "Branch created successfully."),
  ),
  http.get(`${base}/dashboard/branches/:id/qr`, () =>
    ok({
      qrCode:
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 21 21' shape-rendering='crispEdges'>${Array.from({ length: 441 }, (_, i) => ((i * 7919) % 3 === 0 || [0, 1, 2, 20, 22, 42, 40, 41, 18, 19, 38, 418, 419, 438].includes(i) ? `<rect x='${i % 21}' y='${Math.floor(i / 21)}' width='1' height='1'/>` : "")).join("")}</svg>`,
        ),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    }),
  ),
  http.get(`${base}/dashboard/staff`, ({ request }) => {
    const { items, pagination } = paginate(db.staff, new URL(request.url));
    return ok({ staff: items, pagination });
  }),
  http.post(`${base}/dashboard/staff`, () => ok(null, "Staff invitation created successfully.")),
  http.get(`${base}/dashboard/reports`, async () => {
    await delay(300);
    return ok(db.reports());
  }),
];
