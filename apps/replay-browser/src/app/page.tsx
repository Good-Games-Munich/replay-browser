import { ArrowRightIcon } from "lucide-react";
import { auth, signIn } from "@/server/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[rgb(204,70,70)] to-[#cc0052] text-white">
      <h1 className="font-black text-7xl bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-emerald-400 to-indigo-300">
        GGM Replay Browser
      </h1>
      <p className="text-3xl mt-4 font-semibold">
        Browse Melee replays (with style)
      </p>
      <div className="mt-5">
        {session ? (
          <Link
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "text-black",
            })}
            href="/browse"
          >
            See your replays <ArrowRightIcon className="w-4 h-4" />
          </Link>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("discord");
            }}
          >
            <Button type="submit">Login with Discord</Button>
          </form>
        )}
      </div>
    </main>
  );
}
