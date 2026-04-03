'use client';

import { UserPayload } from "@/lib/auth";
import clsx from "clsx";
import { DollarSign, User, History, Settings, Wallet, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface ILinks {
  href:string;
  icon:React.ReactNode;
  title:string;
}

export default function DashboardNavbar ({user}:{user:UserPayload}){
    const {role,stage} = user;
    const pathname = usePathname();
    const links:ILinks[] = [
        {
         href:'/dashboard',
         icon:<DollarSign className="w-5 h-5 mr-2" />, 
         title:'Dashboard'
        },
        {
          href:'/dashboard/profile',
          icon:<User className="w-5 h-5 mr-2" />, 
          title:'Profile'
         },
         {
          href:'/dashboard/subscribe',
          icon:<DollarSign className="w-5 h-5 mr-2" />, 
          title:'Subscriptions'
         },
         {
          href:'/dashboard/transactions',
          icon:<History className="w-5 h-5 mr-2" />, 
          title:'Transactions'
         },
         {
          href:'/dashboard/investments',
          icon:<DollarSign className="w-5 h-5 mr-2" />, 
          title:'Investments'
         },
         {
          href:'/dashboard/deposits',
          icon:<DollarSign className="w-5 h-5 mr-2" />, 
          title:'Deposits'
         },
         {
          href:'/dashboard/settings',
          icon:<Settings className="w-5 h-5 mr-2" />, 
          title:'Settings'
         },
         {
          href:'/dashboard/withdrawal',
          icon:<Wallet className="w-5 h-5 mr-2" />, 
          title:'Withdrawals'
         },
         {
          href:'/dashboard/messages',
          icon:<MessageSquare className="w-5 h-5 mr-2" />, 
          title:'Inbox'
         },
         {
          href:'/kyc',
          icon:<MessageSquare className="w-5 h-5 mr-2" />, 
          title:'KYC'
         },
      ]
    
      const adm_links:ILinks[] = [
        {
         href:'/adm/dashboard',
         icon:<DollarSign className="w-5 h-5 mr-2" />, 
         title:'Dashboard'
        },
        {
          href:'/adm/dashboard/profile',
          icon:<User className="w-5 h-5 mr-2" />, 
          title:'Profile'
         },
         {
          href:'/adm/dashboard/deposits',
          icon:<DollarSign className="w-5 h-5 mr-2" />, 
          title:'Deposits'
         },
         /*{
          href:'/dashboard/settings',
          icon:<Settings className="w-5 h-5 mr-2" />, 
          title:'Settings'
         },*/
         {
          href:'/adm/dashboard/withdrawals',
          icon:<Wallet className="w-5 h-5 mr-2" />, 
          title:'Withdrawals'
         },
         {
          href:'/adm/dashboard/inbox',
          icon:<MessageSquare className="w-5 h-5 mr-2" />, 
          title:'Inbox'
         },
         
      ];


    return (
        <nav className="mt-[-4px] px-4">
                  {role === 'user' ?
                  stage == 1 /*|| stage == 2*/ ?
                  //kyc links
                  links.filter(e=>e.title.toLocaleLowerCase() === 'kyc').map((e)=>{
                    return (
                            <Link href={e.href} key={e.href} className={clsx('flex items-center p-2 rounded-lg',{
                              'bg-amber-300 text-black': e.href === pathname,
                              'text-gray-300 hover:bg-gray-800': e.href !== pathname
                            })}>
                              { e.icon }
                              {e.title}
                            </Link>
                        )
                  })
                  :
                  //normal dashboard
                  links.filter(e=>e.title.toLocaleLowerCase() !== 'kyc').map((e)=>{
                    return (
                            <Link href={e.href} key={e.href} className={clsx('flex items-center p-2 rounded-lg',{
                              'bg-amber-300 text-black': e.href === pathname,
                              'text-gray-300 hover:bg-gray-800': e.href !== pathname
                            })}>
                              { e.icon }
                              {e.title}
                            </Link>
                        )
                  })
                  : 
                  adm_links.map(e=>(
                    <Link href={e.href} key={e.href} className={clsx('flex items-center p-2 rounded-lg',{
                      'bg-amber-300 text-black': e.href === pathname,
                      'text-gray-300 hover:bg-gray-800': e.href !== pathname
                    })}>
                      { e.icon }
                      {e.title}
                    </Link>
                  )) 
                  }         
                  </nav>
    )
}