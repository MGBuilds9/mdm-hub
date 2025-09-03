import { ReactNode } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface ServerLayoutProps {
  children: ReactNode;
}

export function ServerLayout({ children }: ServerLayoutProps) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gray-50">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
