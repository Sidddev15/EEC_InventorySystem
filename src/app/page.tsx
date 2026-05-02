import { getCurrentUser } from "@/lib/auth";
import { ROLE_HOME_PATH } from "@/lib/authz";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect(ROLE_HOME_PATH[user.role]);
}
