import {
  createSessionToken,
} from "@/lib/auth";
import { ROLE_HOME_PATH } from "@/lib/authz";
import { db } from "@/lib/db";
import {
  createManagedUserSchema,
  loginSchema,
  updateManagedUserSchema,
  type LoginInput,
} from "@/lib/validations/auth.schema";
import { verifyPassword } from "./password";
import { hashPassword } from "./password";

export type ManagedUserListItem = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "FACTORY" | "CORPORATE";
  isActive: boolean;
  createdAt: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function login(input: LoginInput) {
  const credentials = loginSchema.parse(input);
  const user = await db.user.findUnique({
    where: {
      email: normalizeEmail(credentials.email),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (user?.isActive && verifyPassword(credentials.password, user.passwordHash)) {
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = await createSessionToken(sessionUser);

    return {
      token,
      user: sessionUser,
      redirectTo: ROLE_HOME_PATH[sessionUser.role],
    };
  }

  throw new Error("Invalid email or password.");
}

export async function listManagedUsers(): Promise<ManagedUserListItem[]> {
  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  }));
}

export async function createManagedUser(input: unknown) {
  const data = createManagedUserSchema.parse(input);
  const email = normalizeEmail(data.email);

  const duplicate = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error("A user with this email already exists.");
  }

  const created = await db.user.create({
    data: {
      name: data.name,
      email,
      role: data.role,
      passwordHash: hashPassword(data.password),
      isActive: data.isActive,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    role: created.role,
    isActive: created.isActive,
    createdAt: created.createdAt.toISOString(),
  } satisfies ManagedUserListItem;
}

export async function updateManagedUser(
  id: string,
  input: unknown,
  actingUserId?: string
) {
  const data = updateManagedUserSchema.parse(input);
  const email = normalizeEmail(data.email);

  const existing = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      isActive: true,
    },
  });

  if (!existing) {
    throw new Error("User not found.");
  }

  const duplicate = await db.user.findFirst({
    where: {
      id: { not: id },
      email,
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error("A user with this email already exists.");
  }

  if (existing.role === "ADMIN" && !data.isActive) {
    const activeAdminCount = await db.user.count({
      where: {
        role: "ADMIN",
        isActive: true,
      },
    });

    if (activeAdminCount <= 1) {
      throw new Error("The last active admin cannot be deactivated.");
    }
  }

  if (existing.role === "ADMIN" && data.role !== "ADMIN") {
    const activeAdminCount = await db.user.count({
      where: {
        role: "ADMIN",
        isActive: true,
      },
    });

    if (activeAdminCount <= 1) {
      throw new Error("The last active admin cannot lose admin access.");
    }
  }

  if (actingUserId && actingUserId === id && !data.isActive) {
    throw new Error("You cannot deactivate your own account.");
  }

  const updated = await db.user.update({
    where: { id },
    data: {
      name: data.name,
      email,
      role: data.role,
      isActive: data.isActive,
      ...(data.password ? { passwordHash: hashPassword(data.password) } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    isActive: updated.isActive,
    createdAt: updated.createdAt.toISOString(),
  } satisfies ManagedUserListItem;
}
