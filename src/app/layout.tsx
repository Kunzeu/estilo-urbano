import "./globals.css";
import Header from "@/components/Header";
import SessionProvider from "@/components/SessionProvider";
import { CartProvider } from "@/components/CartContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800">
        <SessionProvider>
          <CartProvider>
            <Header />
            <main className="pt-20">{children}</main>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
