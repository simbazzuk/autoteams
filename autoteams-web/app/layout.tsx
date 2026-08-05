import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AutoTeams — Better people. Better teams.",
    template: "%s — AutoTeams",
  },
  description:
    "AI-powered team formation for friendship, business, sports, events, education and community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          id="autoteams-theme-script"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const raw = localStorage.getItem("autoteams-ui-preferences");
                const saved = raw ? JSON.parse(raw) : null;
                document.documentElement.dataset.theme = saved?.appearance || "dark";
                document.documentElement.dataset.compact = saved?.compactMode ? "true" : "false";
              } catch {
                document.documentElement.dataset.theme = "dark";
              }
            `,
          }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
