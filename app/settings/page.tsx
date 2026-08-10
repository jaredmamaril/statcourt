import { redirect } from "next/navigation";
import SettingsPageClient from "./settings-client";
import { createSupabaseServerClient } from "../lib/supabase-ssr";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/settings");
  }

  return <SettingsPageClient />;
}
