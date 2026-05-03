'use client';

import { UserPayload } from "@/lib/auth";
import clsx from "clsx";
import { DollarSign, User, History, Settings, Wallet, MessageSquare, SettingsIcon, User2, ShieldCheck, TrendingUp, CreditCard, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";


interface ILinks {
  href:string;
  icon:React.ReactNode;
  title:string;
}

interface IProps {
  user:UserPayload,
  isSidebarVisible:boolean,
  setIsSidebarVisible:()=>void
}

const links: ILinks[] = [
  {
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5 mr-2" />, 
    title: 'Dashboard'
  },
  {
    href: '/dashboard/profile',
    icon: <User className="w-5 h-5 mr-2" />, 
    title: 'Profile'
  },
  {
    href: '/dashboard/subscribe',
    icon: <CreditCard className="w-5 h-5 mr-2" />, 
    title: 'Subscriptions'
  },
  {
    href: '/dashboard/transactions',
    icon: <History className="w-5 h-5 mr-2" />, 
    title: 'Transactions'
  },
  {
    href: '/dashboard/investments',
    icon: <TrendingUp className="w-5 h-5 mr-2" />, 
    title: 'Investments'
  },
  {
    href: '/dashboard/withdrawal',
    icon: <Wallet className="w-5 h-5 mr-2" />, 
    title: 'Withdrawals'
  },
  {
    href: '/dashboard/messages',
    icon: <MessageSquare className="w-5 h-5 mr-2" />, 
    title: 'Inbox'
  },
  {
    href: '/dashboard/settings',
    icon: <Settings className="w-5 h-5 mr-2" />, 
    title: 'Settings'
  },
  /* 
  {
    href: '/kyc',
    icon: <ShieldCheck className="w-5 h-5 mr-2" />, 
    title: 'KYC'
  },
  */
];

const kycLink = [
  {
    href:'/kyc',
    icon:<ShieldCheck className="w-5 h-5 mr-2" />, 
    title:'KYC'
   }
]

const adm_links:ILinks[] = [
  {
   href:'/adm/dashboard',
   icon:<LayoutDashboard className="w-5 h-5 mr-2" />, 
   title:'Dashboard'
  },
  {
    href:'/adm/dashboard/profile',
    icon:<User className="w-5 h-5 mr-2" />, 
    title:'Profile'
   },
   /*{
    href:'/adm/dashboard/deposits',
    icon:<DollarSign className="w-5 h-5 mr-2" />, 
    title:'Deposits'
   },*/
   {
    href:'/adm/dashboard/investments',
    icon:<CreditCard className="w-5 h-5 mr-2" />, 
    title:'Investments'
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
    href:'/adm/dashboard/users',
    icon:<User2 className="w-5 h-5 mr-2" />, 
    title:'Users'
   },
   {
    href:'/adm/dashboard/settings',
    icon:<SettingsIcon className="w-5 h-5 mr-2" />, 
    title:'Settings'
   },
   {
    href:'/adm/dashboard/inbox',
    icon:<MessageSquare className="w-5 h-5 mr-2" />, 
    title:'Inbox'
   },
   
];

export default function DashboardNavbar ({user,isSidebarVisible,setIsSidebarVisible}:IProps){
    const {role,stage} = user;
    
    const pathname = usePathname();

      const pageLinks = role === 'user' ? (stage === 1 ? kycLink : links) : adm_links;

      return <>
              <nav className="mt-[-4px] px-4 md:hidden">
                {
                  pageLinks.map(e=>(
                  <Link href={e.href} key={e.href} className={clsx('flex items-center p-2 rounded-lg',{
                    'bg-amber-300 text-black': e.href === pathname,
                    'text-gray-300 hover:bg-gray-800': e.href !== pathname
                  })} onClick={()=>{
                      //setIsSidebarVisible()
                        setTimeout(()=>{setIsSidebarVisible()},1000)
                      }}>
                    { e.icon }
                    {e.title}
                  </Link>
                  )
                )
                }
              </nav>

              {/**DESKTOP */}
              <nav className="hidden md:block mt-[-4px] px-4">
                {
                  pageLinks.map(e=>(
                  <Link href={e.href} key={e.href} className={clsx('flex items-center p-2 rounded-lg',{
                    'bg-amber-300 text-black': e.href === pathname,
                    'text-gray-300 hover:bg-gray-800': e.href !== pathname
                  })}>
                    { e.icon }
                    {e.title}
                  </Link>
                  )
                )
                }
              </nav>
            </>
                
    
}