import LoginPage from "./login-page";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Log In To Your Account On',           
};

export default function Login(){
    return (
            <LoginPage />
        );
}