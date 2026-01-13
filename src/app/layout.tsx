import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VESC_IT - VESC Configuration Assistant',
  description: 'AI-powered assistant for VESC and Refloat configuration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
