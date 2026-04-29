import { z } from "zod";
import {
  createSessionToken,
  type AuthenticatedUser,
} from "@/lib/auth";
import { ROLE_HOME_PATH } from "@/lib/authz";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

type LoginInput = z.infer<typeof loginSchema>;

const users: Array<AuthenticatedUser & { password: string }> = [
  {
    id: "admin",
    name: "Admin User",
    email: "admin@eec.local",
    role: "ADMIN",
    password: "admin123",
  },
  {
    id: "factory",
    name: "Factory User",
    email: "factory@eec.local",
    role: "FACTORY",
    password: "factory123",
  },
  {
    id: "corporate",
    name: "Corporate User",
    email: "corporate@eec.local",
    role: "CORPORATE",
    password: "corporate123",
  },
];

function toSessionUser(user: AuthenticatedUser & { password: string }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function login(input: LoginInput) {
  const credentials = loginSchema.parse(input);
  const user = users.find(
    (candidate) =>
      candidate.email.toLowerCase() === credentials.email.toLowerCase() &&
      candidate.password === credentials.password
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const sessionUser = toSessionUser(user);
  const token = await createSessionToken(sessionUser);

  return {
    token,
    user: sessionUser,
    redirectTo: ROLE_HOME_PATH[sessionUser.role],
  };
}
