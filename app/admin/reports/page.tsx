import { redirect } from "next/navigation";
import { getAdminContext } from "@/app/lib/admin-auth";
import { AdminReportsClient } from "./reports-client";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const adminContext = await getAdminContext({
    route: "/admin/reports",
    action: "view_admin_reports",
  });

  if (!adminContext.ok) {
    if (adminContext.status === 401) {
      redirect("/signin?next=/admin/reports");
    }

    return (
      <main className="page-enter relative min-h-screen overflow-hidden bg-background px-3 py-8 text-white lg:px-6 lg:py-12">
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.28]"
          style={{
            backgroundImage: "var(--court-pattern)",
            backgroundPosition: "top left",
            backgroundSize: "900px auto",
          }}
        />

        <section className="relative z-10 mx-auto max-w-3xl rounded-lg border border-red-300/25 bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] p-5 text-center shadow-[0_0_24px_rgba(0,0,0,0.28)] lg:p-8">
          <p className="font-michroma text-[9px] uppercase text-red-200 lg:text-xs">
            Unauthorized
          </p>
          <h1 className="mt-3 font-michroma text-lg uppercase text-white lg:text-2xl">
            Admin Access Required
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-michroma text-[8px] leading-relaxed text-white/55 lg:text-[11px]">
            This moderation area is restricted to StatCourt admin accounts.
          </p>
        </section>
      </main>
    );
  }

  return <AdminReportsClient />;
}
