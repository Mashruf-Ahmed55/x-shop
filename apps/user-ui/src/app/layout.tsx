import { Toaster } from '@/components/ui/sonner';
import Header from '@/shared/widgets/header/Header';
import { Metadata } from 'next';
import './global.css';
import Providers from './Providers';

export const metadata: Metadata = {
  title: 'X-shop',
  description: 'X-shop',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`antialiased font-inter`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <Header />
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
