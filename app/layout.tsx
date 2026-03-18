import type { Metadata } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Shadow Azeroth | Link in Bio',
  description: 'Shadow Azeroth - Servidor World of Warcraft. Únete a nuestra comunidad, descarga el launcher y conecta con nosotros.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
