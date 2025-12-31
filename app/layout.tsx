import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1711Tracker",
  description: "Track progress, earn Seals, climb the leaderboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-aurora min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <header className="flex items-center justify-between gap-4">
            <a href="/seals" className="text-xl font-black tracking-tight">
              1711<span className="text-amber-300/90">Tracker</span>
            </a>

            <nav className="flex items-center gap-3 text-sm">
              <a className="text-white/70 hover:text-white" href="/dashboard">
                Dashboard
              </a>

              <a className="text-white/70 hover:text-white" href="/seals">
                Seals
              </a>
              <a className="text-white/70 hover:text-white" href="/leaderboard">
                Leaderboard
              </a>
            </nav>
          </header>

          <main className="mt-6">{children}</main>

          <footer className="mt-10 text-xs text-white/40">
            Built for progress.
          </footer>
        </div>
      </body>
    </html>
  );
}
