import Image from "next/image";
import ScriptButton from "./ScriptButton";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/table-tennis.svg"
          alt="TT logo"
          width={180}
          height={38}
          priority
        />
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">TT Elite Head2Head</h2>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Look for any player matchups which occur within 10 hours of each other
          </li>
          <li>Bet responsibly and safely</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <ScriptButton />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.sofascore.com/tournament/table-tennis/poland/tt-elite-series/19041"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to sofascore →
        </a>
      </footer>
    </div>
  );
}
