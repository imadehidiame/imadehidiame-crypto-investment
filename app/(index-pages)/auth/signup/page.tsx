//'use client';
import SignupPage from "./signup-page";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Sign Up On',           
};


export default function Login(){
    return (
            <SignupPage />
        );
}