import SubscriptionPlansPage from "@/app/ui/pages/subscription-plans";
import { Plans } from "@/lib/config";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Investment Plans',           
};




export default function ContactWrapper(){
    return ( <SubscriptionPlansPage plans={Plans} /> );
}