export default function Court() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <section className="relative flex min-h-screen items-center justify-between bg-[url('/court.svg')] bg-cover bg-center bg-no-repeat px-6 sm:px-10">
        <div className="pointer-events-none absolute left-[39%] top-10 -translate-x-1/2 px-4 font-michroma text-base text-[#4FB3D8] drop-shadow-[0_0_6px_rgba(0,0,0,1)]">
          STATCOURT
        </div>
        <div className="pointer-events-none absolute bottom-10 left-[61%] -translate-x-1/2 px-4 font-michroma text-base text-[#4FB3D8] drop-shadow-[0_0_6px_rgba(0,0,0,1)]">
          STATCOURT
        </div>
      </section>
    </main>
  );
}
