import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "AutoTeams",
  description: "Professional AI team intelligence",
};

const themeScript = `
  try {
    const raw = localStorage.getItem("autoteams-ui-preferences");
    const saved = raw ? JSON.parse(raw) : null;

    document.documentElement.dataset.theme =
      saved?.appearance === "light" || saved?.appearance === "dark"
        ? saved.appearance
        : "dark";

    document.documentElement.dataset.compact =
      saved?.compactMode ? "true" : "false";
  } catch {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.dataset.compact = "false";
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-compact="false"
      suppressHydrationWarning
    >
      <head>
        <script
          id="autoteams-theme-script"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>

      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
