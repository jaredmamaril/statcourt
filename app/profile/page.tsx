import { redirect } from "next/navigation";
import ProfilePageClient from "./profile-client";
import { createSupabaseServerClient } from "../lib/supabase-ssr";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/profile");
  }

  return <ProfilePageClient />;
}
