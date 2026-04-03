'use client';
import { FormProvider } from "@imadehidiame/react-form-validation";

export default function FormProviderLayout({children}:{children:React.ReactNode}){
    return (
        <FormProvider>
            {children}
        </FormProvider>
    );
}