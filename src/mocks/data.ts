/**
 * Demo data for `yarn dev:mock`. Shapes follow the spec where it documents them; for undocumented
 * responses they follow the keys utils/normalize.ts reads first. Not used in production builds.
 */
import dayjs from "dayjs";

const b64 = (o: object) =>
  btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
export const fakeJwt = (hours: number) =>
  `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "cmuser1", exp: Math.floor(Date.now() / 1000) + hours * 3600 })}.mock`;

export const user = {
  id: "cmuser1",
  firstName: "Joseph",
  lastName: "Adeyemi",
  displayName: "Joseph Gym",
  email: "owner@josephgym.com",
  phone: "08012345678",
  avatar: null,
  globalRole: "USER",
  status: "ACTIVE",
  isEmailVerified: true,
  isPhoneVerified: false,
  createdAt: "2023-01-12T10:30:00.000Z",
};

export const organizations = [
  {
    id: "org1",
    name: "Joseph Gym",
    logo: null,
    city: "Lagos",
    state: "Nigeria",
    role: "OWNER",
    membershipStatus: "ACTIVE",
    isActive: true,
  },
  {
    id: "org2",
    name: "Tohans Fitness",
    logo: null,
    city: "Ibadan",
    state: "Oyo",
    role: "MANAGER",
    membershipStatus: "ACTIVE",
    isActive: false,
  },
];

export const organization = {
  id: "org1",
  name: "Joseph Gym",
  slug: "joseph-gym",
  email: "hello@josephgym.com",
  phone: "08012345678",
  address: "12 Admiralty Way",
  city: "Lekki",
  state: "Lagos",
  country: "Nigeria",
  description: "Strength, conditioning and community across Lagos and Abuja.",
  logo: null,
};

export const branches = [
  {
    id: "br1",
    name: "Joseph Gym — Lekki",
    code: "LEKKI-001",
    address: "Lekki Phase 1",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    email: "lekki@josephgym.com",
    phone: "08011112222",
    isPrimary: true,
    isActive: true,
    createdAt: "2021-03-01T00:00:00Z",
    membersCount: 487,
    staffCount: 12,
    monthlyRevenue: 3200000,
  },
  {
    id: "br2",
    name: "Joseph Gym — Ikeja",
    code: "IKEJA-001",
    address: "Ikeja GRA",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    email: "ikeja@josephgym.com",
    phone: "08022223333",
    isPrimary: false,
    isActive: true,
    createdAt: "2022-07-01T00:00:00Z",
    membersCount: 392,
    staffCount: 9,
    monthlyRevenue: 2800000,
  },
  {
    id: "br3",
    name: "Joseph Gym — VI",
    code: "VI-001",
    address: "Victoria Island",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    email: "vi@josephgym.com",
    phone: "08033334444",
    isPrimary: false,
    isActive: true,
    createdAt: "2023-01-01T00:00:00Z",
    membersCount: 321,
    staffCount: 8,
    monthlyRevenue: 2400000,
  },
  {
    id: "br4",
    name: "Joseph Gym — Abuja",
    code: "ABJ-001",
    address: "Wuse 2",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria",
    email: "abuja@josephgym.com",
    phone: "08044445555",
    isPrimary: false,
    isActive: true,
    createdAt: "2026-08-01T00:00:00Z",
    membersCount: 48,
    staffCount: 4,
    monthlyRevenue: 60000,
  },
  {
    id: "br5",
    name: "Joseph Gym — Surulere",
    code: "SUR-001",
    address: "Surulere",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    email: null,
    phone: null,
    isPrimary: false,
    isActive: false,
    createdAt: "2026-10-01T00:00:00Z",
    membersCount: 0,
    staffCount: 0,
  },
];

const names = [
  ["Adebayo", "Okafor"],
  ["Chioma", "Eze"],
  ["Emeka", "Nwachukwu"],
  ["Fatima", "Bello"],
  ["Gbenga", "Adewale"],
  ["Halima", "Sule"],
  ["Ifeanyi", "Okeke"],
  ["Jumoke", "Adesanya"],
  ["Kelechi", "Ugwu"],
  ["Laila", "Musa"],
  ["Mustapha", "Garba"],
  ["Ngozi", "Obi"],
  ["Tunde", "Adebayo"],
  ["Aisha", "Bello"],
  ["Daniel", "Obinna"],
];

export const plans = [
  {
    id: "pl1",
    branchId: "br1",
    name: "Basic",
    description: "Gym floor and locker room access",
    price: 6000,
    duration: 1,
    durationUnit: "MONTH",
    gracePeriod: 3,
    status: "ACTIVE",
    activeMembers: 148,
    revenue: 888000,
  },
  {
    id: "pl2",
    branchId: "br1",
    name: "Standard",
    description: "All Basic features plus 5 group classes a month",
    price: 12000,
    duration: 1,
    durationUnit: "MONTH",
    gracePeriod: 3,
    status: "ACTIVE",
    activeMembers: 312,
    revenue: 3744000,
  },
  {
    id: "pl3",
    branchId: "br1",
    name: "Premium",
    description: "Unlimited classes, 4 PT sessions a month, nutrition consultation",
    price: 18000,
    duration: 1,
    durationUnit: "MONTH",
    gracePeriod: 5,
    status: "ACTIVE",
    activeMembers: 421,
    revenue: 7578000,
  },
  {
    id: "pl4",
    branchId: "br1",
    name: "VIP",
    description: "Unlimited PT, spa, VIP lounge and a dedicated trainer",
    price: 30000,
    duration: 1,
    durationUnit: "MONTH",
    gracePeriod: 7,
    status: "ACTIVE",
    activeMembers: 105,
    revenue: 3150000,
  },
];

const statuses = [
  "ACTIVE",
  "ACTIVE",
  "INACTIVE",
  "ACTIVE",
  "ACTIVE",
  "SUSPENDED",
  "ACTIVE",
  "ACTIVE",
  "INACTIVE",
  "ACTIVE",
  "ACTIVE",
  "ACTIVE",
  "ACTIVE",
  "ACTIVE",
  "ACTIVE",
];

export const members = names.map(([firstName, lastName], i) => {
  const plan = plans[i % 4];
  const start = dayjs().subtract(20 + i * 3, "day");
  return {
    id: `mem${i + 1}`,
    membershipNumber: `HG-${String(10428 + i).padStart(6, "0")}`,
    firstName,
    lastName,
    middleName: null,
    email: `${firstName.toLowerCase()}@email.com`,
    phone: `080${String(12345678 + i * 1111111).slice(0, 8)}`,
    profileImage: null,
    status: statuses[i],
    joinedAt: dayjs()
      .subtract(300 - i * 17, "day")
      .toISOString(),
    homeBranch: { id: branches[i % 3].id, name: branches[i % 3].name, code: branches[i % 3].code },
    currentMembership:
      statuses[i] === "ACTIVE"
        ? {
            id: `ms${i + 1}`,
            plan: { id: plan.id, name: plan.name },
            startDate: start.toISOString(),
            endDate: start.add(1, "month").toISOString(),
            price: `${plan.price}.00`,
            status: "ACTIVE",
          }
        : null,
  };
});

export const memberships = members.map((m, i) => {
  const plan = plans[i % 4];
  const start = dayjs().subtract(20 + i * 9, "day");
  const end = start.add(1, "month");
  return {
    id: `ms${i + 1}`,
    member: { id: m.id, firstName: m.firstName, lastName: m.lastName, profileImage: null },
    plan: { id: plan.id, name: plan.name },
    branch: { id: m.homeBranch.id, name: m.homeBranch.name },
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    price: `${plan.price}.00`,
    status: end.isBefore(dayjs()) ? "EXPIRED" : i === 8 ? "SUSPENDED" : "ACTIVE",
  };
});

const roles = [
  "GENERAL_MANAGER",
  "RECEPTIONIST",
  "MANAGER",
  "RECEPTIONIST",
  "MANAGER",
  "RECEPTIONIST",
  "MANAGER",
  "RECEPTIONIST",
  "MANAGER",
];
export const staff = [
  "Tunde Adeyemi",
  "Amaka Okonkwo",
  "Biodun Salami",
  "Chukwudi Obi",
  "Dupe Oladele",
  "Emeka Chibuike",
  "Funmi Adeleke",
  "Godwin Eze",
  "Hauwa Abdullahi",
].map((n, i) => {
  const [firstName, lastName] = n.split(" ");
  return {
    id: `st${i + 1}`,
    role: roles[i],
    status: i === 5 ? "INACTIVE" : "ACTIVE",
    joinedAt: dayjs()
      .subtract(400 - i * 30, "day")
      .toISOString(),
    user: {
      id: `u${i + 1}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}@josephgym.com`,
      phone: `0801111${String(2222 + i * 1111).slice(0, 4)}`,
    },
    branches:
      roles[i] === "GENERAL_MANAGER"
        ? []
        : [{ id: branches[i % 4].id, name: branches[i % 4].name.replace("Joseph Gym — ", "") }],
  };
});

export function overview(growthPeriod: string, startDate?: string, endDate?: string) {
  const days =
    growthPeriod === "7d"
      ? 7
      : growthPeriod === "custom" && startDate && endDate
        ? Math.max(1, dayjs(endDate).diff(startDate, "day") + 1)
        : 30;
  const end = growthPeriod === "custom" && endDate ? dayjs(endDate) : dayjs();
  return {
    scope: { type: "ORGANIZATION", organizationId: "org1", branchId: null },
    metrics: {
      totalMembers: { value: 1248, previousValue: 1114, percentageChange: 12 },
      activeMemberships: { value: 986, previousValue: 913, percentageChange: 8 },
      monthlyCheckIns: { value: 4184, previousValue: 3638, percentageChange: 15 },
      monthlyRevenue: { value: "8460000.00", previousValue: "7690000.00", percentageChange: 10 },
    },
    membershipStatus: { active: 986, expiringSoon: 162, inactive: 100 },
    membershipGrowth: {
      period: growthPeriod,
      startDate: end.subtract(days - 1, "day").toISOString(),
      endDate: end.toISOString(),
      data: Array.from({ length: days }, (_, i) => ({
        date: end.subtract(days - 1 - i, "day").format("YYYY-MM-DD"),
        activeMemberships: Math.round(800 + (i / days) * 600 + Math.sin(i / 2) * 25),
      })),
    },
    upcomingRenewals: memberships
      .slice(0, 5)
      .map((m, i) => ({ ...m, endDate: dayjs().add([3, 6, 8, 11, 13][i], "day").toISOString() })),
    recentActivities: members.slice(0, 8).map((m, i) => ({
      id: `att${i}`,
      type: i % 3 === 2 ? "CHECK_OUT" : "CHECK_IN",
      member: { id: m.id, firstName: m.firstName, lastName: m.lastName },
      checkedInAt: dayjs()
        .subtract(i * 47 + 12, "minute")
        .toISOString(),
      checkoutAt:
        i % 3 === 2
          ? dayjs()
              .subtract(i * 20, "minute")
              .toISOString()
          : null,
      branch: { id: m.homeBranch.id, name: m.homeBranch.name.replace("Joseph Gym — ", "") },
    })),
  };
}

export function memberDetails(id: string) {
  const m = members.find((x) => x.id === id) ?? members[0];
  return {
    member: {
      ...m,
      gender: "MALE",
      dateOfBirth: "1990-05-14",
      address: "12 Bourdillon Road, Victoria Island, Lagos",
    },
    homeBranch: m.homeBranch,
    currentMembership: m.currentMembership && {
      ...m.currentMembership,
      plan: {
        ...m.currentMembership.plan,
        description: "Full gym access, all classes",
        duration: 1,
        durationUnit: "MONTH",
      },
    },
    membershipHistory: [
      {
        id: "h1",
        plan: { name: "Premium Plan" },
        startDate: "2024-01-12",
        endDate: "2025-04-12",
        price: "45000.00",
        status: "ACTIVE",
      },
      {
        id: "h2",
        plan: { name: "Standard Plan" },
        startDate: "2023-10-12",
        endDate: "2024-01-11",
        price: "30000.00",
        status: "EXPIRED",
      },
      {
        id: "h3",
        plan: { name: "Basic Plan" },
        startDate: "2023-07-05",
        endDate: "2023-10-11",
        price: "20000.00",
        status: "EXPIRED",
      },
    ],
    attendanceSummary: {
      monthlyVisits: 16,
      totalVisits: 142,
      percentageChange: 23,
      lastCheckIn: dayjs().subtract(3, "hour").toISOString(),
    },
    attendance14Days: Array.from({ length: 14 }, (_, i) => ({
      date: dayjs()
        .subtract(13 - i, "day")
        .format("YYYY-MM-DD"),
      checkIns: [1, 2, 1, 0, 2, 1, 0, 2, 1, 2, 1, 1, 2, 2][i],
    })),
    recentCheckIns: Array.from({ length: 5 }, (_, i) => ({
      id: `rc${i}`,
      checkedInAt: dayjs()
        .subtract(i * 2, "day")
        .hour(7)
        .minute(10 + i * 7)
        .toISOString(),
      checkedOutAt: dayjs()
        .subtract(i * 2, "day")
        .hour(9)
        .minute(i * 9)
        .toISOString(),
      branch: { name: "Victoria Island" },
      status: "CHECKED_OUT",
    })),
  };
}

export function reports() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const rev = [5.2, 5.8, 6.1, 5.9, 6.7, 7.2, 7.8, 8.1, 8.46];
  return {
    summary: {
      totalRevenue: { value: 61300000, percentageChange: 18 },
      totalMembers: { value: 1248, percentageChange: 12 },
      activeMembers: { value: 986, percentageChange: 8 },
      averageDailyCheckIns: { value: 184, percentageChange: 15 },
    },
    monthlyRevenue: months
      .slice(-6)
      .map((month, i) => ({ month, revenue: rev.slice(-6)[i] * 1_000_000 })),
    membersByPlan: [
      { planName: "Premium", members: 421, percentage: 43 },
      { planName: "Standard", members: 312, percentage: 32 },
      { planName: "Basic", members: 148, percentage: 15 },
      { planName: "VIP", members: 105, percentage: 11 },
    ],
    weeklyCheckIns: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
      day,
      checkIns: [162, 178, 191, 174, 203, 220, 145][i],
    })),
    topMembers: [3, 7, 9, 0, 4].map((idx, i) => ({
      member: {
        id: members[idx].id,
        firstName: members[idx].firstName,
        lastName: members[idx].lastName,
      },
      plan: { name: plans[[3, 2, 3, 2, 2][i]].name },
      visits: [26, 24, 23, 22, 20][i],
      revenue: [60000, 36000, 60000, 36000, 36000][i],
    })),
  };
}
