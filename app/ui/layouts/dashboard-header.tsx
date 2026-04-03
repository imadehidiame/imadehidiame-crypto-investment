'use client';

import { useEffect, useRef, useState } from "react";
import { Button } from "../buttons";
import { DollarSign, MessageSquare, Settings, TrendingUp, User, Wallet, X } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface HeaderDropdownProps {
    totalInvestableBalance: number;
    currentInvestmentTotal: number;
    investableBalance: number;
    handleLogout: () => void;
    role:'user'|'admin'
  }
  
  export function HeaderDropdown({
    totalInvestableBalance,
    currentInvestmentTotal,
    investableBalance,
    handleLogout,
    role
  }: HeaderDropdownProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    //const navigation = useNavigation();
    //const
  
    //const isSubmitting = navigation.state === 'submitting';
  
    const toggleDropdown = () => {
      setDropdownOpen((prev) => !prev);
    };
  
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(value);
    };
  
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          className="text-amber-300 hover:text-amber-50 cursor-pointer"
          onClick={toggleDropdown}
          aria-label="User menu"
        >
          <User className="w-6 h-6" />
        </Button>
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 md:w-80 sm:w-64">
            {/* Total Investable Balance */}
            <div className="flex items-center justify-between px-4 py-2 text-gray-300 border-b border-gray-700 md:flex-row sm:flex-col">
              <div className="flex items-center flex-nowrap">
                <Wallet className="w-4 h-4 mr-2 text-amber-300" />
                <span>Total Investable</span>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-amber-300 text-gray-800">
                {formatCurrency(totalInvestableBalance)}
              </span>
            </div>
  
            {/* Current Investment Total */}
            <div className="flex items-center justify-between px-4 py-2 text-gray-300 border-b border-gray-700 md:flex-row sm:flex-col">
              <div className="flex items-center flex-nowrap">
                <TrendingUp className="w-4 h-4 mr-2 text-amber-300" />
                <span>Current Investments</span>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-emerald-300 text-gray-800">
                {formatCurrency(currentInvestmentTotal)}
              </span>
            </div>
  
            {/* Investable Balance (Available to Invest Now) */}
            <div className="flex items-center justify-between px-4 py-2 text-gray-300 border-b border-gray-700 md:flex-row sm:flex-col">
              <div className="flex items-center flex-nowrap">
                <DollarSign className="w-4 h-4 mr-2 text-amber-300" />
                <span>Available to Invest</span>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-blue-300 text-gray-800">
                {formatCurrency(investableBalance)}
              </span>
            </div>
  
            {/* Existing Navigation Links */}
            <Link
              href="/dashboard/profile"
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700"
              onClick={() => setDropdownOpen(false)}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Link>
            <Link
              href="/dashboard/messages"
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700"
              onClick={() => setDropdownOpen(false)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Inbox
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700"
              onClick={() => setDropdownOpen(false)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
  
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700">
                  <X className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 text-gray-100 border-amber-300/50">
                <DialogHeader>
                  <DialogTitle className="text-white">Are you sure?</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    You'll have to log back in to access your earnings and wallet information
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  {/*<DialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">Cancel</AlertDialogCancel>*/}
                  {/* Form to trigger the delete action when confirmed */}
                  {/*<Form method="POST" action={`/api/logout`} preventScrollReset={true}>
                    <input type="hidden" name="role" value={role} />*/}
                    <Link href={'/api/logout'}>
                    <Button type="submit" className="bg-red-500 text-white hover:bg-red-600">
                      {/*isSubmitting && <Loader2 className="animate-spin" />*/}
                      {/*isSubmitting  ? 'Logging out...' : 'Log out'*/}
                      Log out
                    </Button>
                    </Link>
                </DialogFooter>
              </DialogContent>
            </Dialog>
  
            {/*<button
              className="flex items-center w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700"
              
            >
              <X className="w-4 h-4 mr-2" />
              Logout
            </button>*/}
          </div>
        )}
      </div>
    );
  }
  
  export const Header = ({ investments, investable, earnings, role }: { investments: number, investable: number, earnings: number, role:'user'|'admin' }) => {
    const handleLogout = () => {
      //console.log('User logged out');
    };
  
    const [totalInvestableBalance, set_total] = useState<number>(earnings || 0);
    const [currentInvestmentTotal, set_investment] = useState<number>(investments || 0);
    const [investableBalance, set_investable] = useState<number>(investable || 0);
  
    useEffect(() => {
      set_total(totalInvestableBalance);
      set_investable(investableBalance);
      set_investment(currentInvestmentTotal);
    }, [totalInvestableBalance, currentInvestmentTotal, investableBalance])
  
    return (
      <HeaderDropdown
        totalInvestableBalance={totalInvestableBalance}
        currentInvestmentTotal={currentInvestmentTotal}
        investableBalance={investableBalance}
        handleLogout={handleLogout}
        role={role}
      />
  
    );
  };
