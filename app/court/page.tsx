export default function Court() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <section className="relative flex min-h-screen items-center justify-between bg-[url('/court.svg')] bg-cover bg-center bg-no-repeat px-6 sm:px-10">
        <div className="absolute left-0 top-0 z-10 h-full w-1/2">
          <h1 className="absolute left-10 top-8 font-michroma text-2xl px-10 py-6 text-white font-bold">
            CHOOSE YOUR PLAYER
          </h1>
        </div>
        <div className="absolute right-0 top-0 z-10 h-full w-1/2">
          <h1 className="absolute right-10 top-8 font-michroma text-2xl px-10 py-6  text-white font-bold">
            CHOOSE YOUR PLAYER
          </h1>
        </div>
      </section>
    </main>
  );
}
