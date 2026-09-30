import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BEMACS Exam Prep",
    template: "%s · BEMACS Exam Prep",
  },
  description: "Exam preparation for Bocconi BEMACS students, mapped to the syllabus.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
