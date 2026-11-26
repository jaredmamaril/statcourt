import { notFound } from "next/navigation";
import { publicProfileExists } from "../../lib/public-profile-lookup";
import { PublicProfileClient } from "./public-profile-client";

type PublicProfilePageProps = {
  params: Promise<{ username: string }>;
};

// Unknown (or private) usernames get a real 404 (not-found.tsx). If the lookup itself
// fails, the profile renders as before and shows its own error state.
export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;

  if ((await publicProfileExists(username)) === false) {
    notFound();
  }

  return <PublicProfileClient />;
}
