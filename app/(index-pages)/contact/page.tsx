import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Contact',           
};


import ContactPage from "./contact-page";

export default function ContactWrapper(){
    return ( <ContactPage /> );
}