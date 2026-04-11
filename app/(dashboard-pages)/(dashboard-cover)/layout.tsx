'use client';
import CryptoTicker from "@/app/ui/components/crypto-ticker";
import { FormProvider } from "@imadehidiame/react-form-validation";

export default function FormProviderLayout({children}:{children:React.ReactNode}){
    return (
        <FormProvider>
            {children}
            
        </FormProvider>
    );
}