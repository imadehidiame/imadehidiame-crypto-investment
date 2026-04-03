import '@/app/ui/global.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import ToastProvider from './ui/providers/toast-provider';


const inter = Inter({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={`${inter.className} antialiased`}>
        <ToastProvider />
        
          {children}
        
     </body>
    </html>
  );
}
