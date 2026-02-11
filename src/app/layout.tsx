import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const metadata: Metadata = {
  title: {
    default: 'OpsMarketplace | Managed HR & Compliance Services for SMEs',
    template: '%s | OpsMarketplace',
  },
  description: 'Connect with verified HR, Payroll, and Labour Compliance experts. A managed marketplace for Indian SMEs to scale operations with AI-matched delivery.',
  keywords: ['HR Compliance', 'Labour Law India', 'Payroll Outsourcing', 'SME Services', 'Shop Act Registration', 'Compliance Consultant'],
  authors: [{ name: 'OpsMarketplace Team' }],
  creator: 'OpsMarketplace',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://opsmarketplace.com',
    title: 'OpsMarketplace | Managed HR & Compliance for SMEs',
    description: 'Stop searching directories. Get AI-matched with verified operational experts for your business.',
    siteName: 'OpsMarketplace',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpsMarketplace | Managed HR & Compliance for SMEs',
    description: 'Scale your business operations with verified expert intelligence.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen flex flex-col">
        <AuthProvider>
          <FirebaseErrorListener />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="border-t bg-white py-8">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} OpsMarketplace. For SMEs and Consultants.
            </div>
          </footer>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
