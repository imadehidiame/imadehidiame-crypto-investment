'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
//import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getCurrentUser, getUserRole, getUserStage, UserPayload } from '@/lib/auth';
import { CIFullLogoDashboard } from './logos';
import DashboardNavbar from './dashboard-navbar';
import { Header } from './dashboard-header';

// Mock data (replace with real data from your backend)
const portfolioData = [
  { date: '2025-05-01', value: 10000 },
  { date: '2025-05-02', value: 10500 },
  { date: '2025-05-03', value: 10000 },
  { date: '2025-05-04', value: 10800 },
  { date: '2025-05-05', value: 11000 },
  { date: '2025-05-06', value: 11500 },
];

const recentTransactions = [
  { id: '1', date: '2025-05-14', type: 'Buy', asset: 'BTC', amount: 0.5, value: 25000 },
  { id: '2', date: '2025-05-13', type: 'Sell', asset: 'ETH', amount: 2, value: 4000 },
];

/*export const loader = async ({ context }: Route.LoaderArgs) => {
  const { account_info } = await import('@/lib/utils.server');
  const user_context = getSess(context);
  const account = await account_info(user_context?.user?._id!);
  //log(account,'Account info');
  //log(user_context,'USER CONTEXT')
  return { user: { name: user_context?.user?.name, email: user_context?.user?.email, role: user_context?.user?.role }, account };
};*/

export default function DashboardClientLayout(/*{ loaderData }: Route.ComponentProps*/
    {
    children,
    loaderData,
    user
    }:{
        children:React.ReactNode,
        loaderData:{
            account:{
                investments?:number,
                earnings?:number,
                investable?:number
            }
        },
        user:UserPayload
    }
) {
  //const user = await getCurrentUser();
  const {account} = loaderData!;
  /*const loaderData = {
    account:{
      investments:5000,
      earnings:10000,
      investable:1500
    }
  }*/
  
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  //const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, dropdownOpen]);

  const handleLogout = () => {
    console.log('User logged out');
    setDropdownOpen(false);
  };



  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out overflow-visible`}
      >
        <div className="sticky top-0 z-30 bg-gray-900 min-h-[120px] overflow-visible">
          <div className="p-3 max-sm:p-2 flex justify-between items-start min-h-[120px] flex-shrink-0 overflow-visible">
            <CIFullLogoDashboard />
            <Button
              variant="ghost"
              className="md:hidden text-amber-300"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          <DashboardNavbar user={user!} />
                     
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 w-full bg-gray-900 p-3 max-sm:p-2 flex justify-between items-center z-50 md:pl-[272px]">
          <Button
            variant="ghost"
            className="md:hidden text-amber-300"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="text-amber-300 font-semibold">Welcome, {user!.name?.split(' ')[0]}</div>

          <Header investable={account?.investable || 0} earnings={account?.earnings || 0} investments={account?.investments || 0} role={user!.role as 'user'|'admin'} />

        </header>
        {/* Main content with padding to avoid overlap */}
        <div className="pt-16 md:ml-64">
          
            {children}
          
        </div>
      </div>
    </div>
  );
}



