'use client';

import SectionWrapper from "@/app/ui/components/section-wrapper";
import { FormProvider } from "@imadehidiame/react-form-validation";
import ContactPage from "./contact-page";
//import { FormProvider } from "react-hook-form";

export default function ContactWrapper(){
    return (<SectionWrapper animationType='fadeInUp' md_padding='0' padding='0'>
                <FormProvider>
                    <ContactPage />
                </FormProvider>
            </SectionWrapper>);
}