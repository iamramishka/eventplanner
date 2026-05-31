export type AppRole = "couple" | "vendor" | "super_admin";

export type AuthSessionBase = {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
  accountStatus?: "active" | "suspended" | "deleted";
};

export type CoupleSession = AuthSessionBase & {
  role: "couple";
  hasWedding: boolean;
  subscriptionStatus?: "trial" | "active" | "expired" | "grace" | "suspended";
};

export type VendorSession = AuthSessionBase & {
  role: "vendor";
  vendorId: string;
  businessName: string;
};

export type AdminSession = AuthSessionBase & {
  role: "super_admin";
  adminId: string;
  lastLoginAt: string;
};

export type AppSession = CoupleSession | VendorSession | AdminSession;

export type AuthAccountBase = AuthSessionBase & {
  password: string;
};

export type CoupleAccount = AuthAccountBase & {
  role: "couple";
  hasWedding: boolean;
};

export type VendorAccount = AuthAccountBase & {
  role: "vendor";
  vendorId: string;
  businessName: string;
};

export type AdminAccount = AuthAccountBase & {
  role: "super_admin";
  adminId: string;
  lastLoginAt: string;
};

export type AuthAccountRecord = CoupleAccount | VendorAccount | AdminAccount;
