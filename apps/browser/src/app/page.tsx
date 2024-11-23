import { ArrowLeftToLineIcon } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[rgb(204,70,70)] to-[#cc0052] text-white">
      <h1 className="font-black text-7xl bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-emerald-400 to-indigo-300">
        GGM Replay Browser
      </h1>
      <p className="text-3xl mt-4 font-semibold">
        Browse Melee replays (with style)
      </p>
      <Link
        href="/api/auth/discord"
        className="mt-8 px-6 py-3 rounded-lg font-semibold
          bg-white text-black
          transform transition-all duration-300
          hover:scale-105 hover:shadow-lg hover:shadow-white/10
          active:scale-95
          flex items-center gap-2"
      >
        <span>Login here</span>
        <ArrowLeftToLineIcon className="w-5 h-5" />
      </Link>
    </main>
  );
}
