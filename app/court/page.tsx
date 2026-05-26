export default function Court() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <section className="relative flex min-h-screen items-center justify-between bg-[url('/court.svg')] bg-cover bg-center bg-no-repeat px-6 sm:px-10">
        <div className="absolute left-0 top-0 z-10 flex h-full w-1/2 justify-start pl-3 pt-35">
          <div className="flex flex-col items-center">
            <h1 className="font-michroma text-xl text-white font-bold">
              CHOOSE YOUR PLAYER
            </h1>

            <div className="mt-6 flex h-56 w-56 items-center justify-center rounded-md border border-white/30 bg-black/30 text-sm text-white/60 backdrop-blur-sm ">
              Player Image{" "}
            </div>

            <select className="mt-8 w-56 rounded-md border border-white/30 bg-black/30 px-4 py-3 font-michroma text-white outline-none backdrop-blur-sm">
              <option value="select-player">Choose Player</option>
              <option value="lebron-james">LeBron James</option>
              <option value="michael-jordan">Michael Jordan</option>
              <option value="kobe-bryant">Kobe Bryant</option>
              <option value="stephen-curry">Stephen Curry</option>
            </select>
          </div>
        </div>

        <div className="absolute right-0 top-0 z-10 flex h-full w-1/2 justify-end pr-3 pt-35">
          <div className="flex flex-col items-center">
            <h1 className="font-michroma text-xl font-bold text-white">
              CHOOSE YOUR PLAYER
            </h1>

            <div className="mt-10 flex h-56 w-56 items-center justify-center rounded-md border border-white/30 bg-black/30 text-sm text-white/60 backdrop-blur-sm">
              Player Image
            </div>

            <select className="mt-8 w-56 rounded-md border border-white/30 bg-black/30 px-4 py-3 font-michroma text-white outline-none backdrop-blur-sm">
              <option value="select-player">Choose Player</option>
              <option value="lebron-james">LeBron James</option>
              <option value="michael-jordan">Michael Jordan</option>
              <option value="kobe-bryant">Kobe Bryant</option>
              <option value="stephen-curry">Stephen Curry</option>
            </select>
          </div>
        </div>
      </section>
    </main>
  );
}
