import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AutoTeams — Better people. Better teams.", template: "%s — AutoTeams" },
  description: "AI-powered team formation for friendship, business, sports, events, education and community.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
