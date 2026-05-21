import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans text-slate-900 px-4">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center text-center py-20 gap-8">
        <div className="inline-block rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-medium text-rose-600 shadow-sm">
          Welcome to TravelPlanner 🌍
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 max-w-3xl leading-tight">
          Your Next Journey, <br className="hidden md:block" />
          <span className="text-rose-500">Planned by AI.</span>
        </h1>
        
        <p className="max-w-xl text-lg text-slate-600 leading-relaxed">
          Create personalized, budget-friendly itineraries in seconds. Tell us where you want to go, and let our smart assistant handle the rest.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
          <Link
            href="/generate"
            className="flex items-center justify-center h-14 rounded-2xl bg-rose-500 px-8 text-white font-medium hover:bg-rose-600 transition shadow-sm w-full sm:w-auto text-lg"
          >
            Start Planning
          </Link>
          <Link
            href="/trips"
            className="flex items-center justify-center h-14 rounded-2xl bg-white border border-slate-200 px-8 text-slate-700 font-medium hover:bg-slate-50 transition shadow-sm w-full sm:w-auto text-lg"
          >
            View My Trips
          </Link>
        </div>
      </main>
    </div>
  );
}
