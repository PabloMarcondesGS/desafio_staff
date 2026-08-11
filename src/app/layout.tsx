import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { FeedbackProvider } from "@/contexts/FeedbackContext";

export const metadata: Metadata = {
  title: "FixCar - Sistema de Inspeção Veicular",
  description: "Sistema completo para cadastro, execução e gestão de inspeções veiculares com blueprint interativo e laudo técnico.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <FeedbackProvider>
          <AuthProvider>{children}</AuthProvider>
        </FeedbackProvider>
      </body>
    </html>
  );
}
