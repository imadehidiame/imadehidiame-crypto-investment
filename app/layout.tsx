import '@/app/ui/global.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import ToastProvider from './ui/providers/toast-provider';
import { Metadata } from 'next';
import CryptoTickerFixed from './ui/components/crypto-ticker-fixed';
import { AuthProvider } from '@/lib/providers/auth-provider';


const inter = Inter({subsets:['latin'],variable:'--font-sans'});



export const metadata: Metadata = {
  title: {
    default: 'CoinInvestX',
    template: '%s | CoinInvestX',
  },
  description: 'The future of cryptocurrency trading and investment. Explore the latest crypto investment opportunities, market trends, and expert insights at CoinInvestX, your trusted source for cryptocurrency wealth building.',

  // Favicon and Icons
  icons: {
    icon: '/icons/icon500.png',
    apple: '/icons/icon500.png',
    shortcut: '/icons/icon500.png',
  },

  // Open Graph
  openGraph: {
    title: 'CoinInvestX - Crypto Investment Insights',
    description: 'The future of cryptocurrency trading and investment. Explore the latest crypto investment opportunities, market trends, and expert insights at CoinInvestX, your trusted source for cryptocurrency wealth building.',
    url: 'https://tesla.cinvdesk.com',
    siteName: 'CoinInvestX',
    images: [
      {
        url: '/icons/icon500.png',
        width: 512,
        height: 512,
        alt: 'CoinInvestX Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'CoinInvestX - Crypto Investment Insights',
    description: 'Explore crypto investment opportunities and trends with CoinInvestX, your trusted crypto resource.',
    images: ['/icons/icon500.png'],
    site: '@CoinInvestX',
  },

  // Additional Meta
  keywords: ['crypto', 'investment', 'bitcoin', 'cryptocurrency', 'trading', 'wealth building','doge','ethereum'],
  authors: [{ name: 'CoinInvestX' }],
  metadataBase: new URL('https://tesla.cinvdesk.com'),
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
        <ToastProvider />
        
          {children}
        {/*<CryptoTickerFixed />*/}
        </AuthProvider>
     </body>
    </html>
  );
}
