'use client';
import { FormProvider } from "@imadehidiame/react-form-validation";
import Footer from "../ui/layouts/footer";
import Navbar from "../ui/layouts/navbar";

export default function Layout({children}:{children:React.ReactNode}){
    
    return (
      <div className="flex flex-col min-h-screen bg-black text-gray-100">
        <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <FormProvider>
            {children}
            </FormProvider>
          </main>
        <Footer />
      </div>
    );
}