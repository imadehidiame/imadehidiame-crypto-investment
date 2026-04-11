'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, DollarSign, Clock, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { IInvestmentAdmin } from '@/types';
import SectionWrapper from './section-wrapper';

interface InvestmentManagementProps {
  investments: IInvestmentAdmin[];
  onConfirmDeposit: (investmentId: string) => void;
  onAddProfit: (investmentId: string) => void;
  onConfirmUpgradeFee: (investmentId: string) => void;
  onConfirmWithdrawal: (investmentId: string) => void;
  loading:boolean;
}

const HOUR_IN_SECONDS = 60 * 60;
const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24;
const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7;


const isValidTransaction = (investment:IInvestmentAdmin)=>{
  const additionalDate = investment.investmentDate.getTime() + ((investment.durationFlag == 'days' ? 
    (investment.duration * DAY_IN_SECONDS) : (investment.duration * HOUR_IN_SECONDS))*1000);
  return new Date(additionalDate) > new Date(Date.now());
  /*return parseInt((investment.investmentDate.getTime()/1000).toString()) + (investment.durationFlag == 'days' ? 
    (investment.duration * DAY_IN_SECONDS) : (investment.duration * HOUR_IN_SECONDS)) < 
    parseInt(((new Date).getTime()/1000).toString());*/
}

const isTransactionActive = (investment:IInvestmentAdmin) => {
  return investment.isActive && isValidTransaction(investment)
}

const isTransactionComplete = (investment:IInvestmentAdmin) => {
  return investment.isActive && !isValidTransaction(investment)
}

export default function AdmInvestmentSection({
  investments,
  onConfirmDeposit,
  onAddProfit,
  onConfirmUpgradeFee,
  onConfirmWithdrawal,
  loading=false
}: InvestmentManagementProps) {

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  const filteredInvestments = investments.filter(inv => {
    if (activeTab === 'pending') 
        return !inv.isActive;
    if (activeTab === 'active') 
        return isTransactionActive(inv);
    if (activeTab === 'completed') 
        return isTransactionComplete(inv);
    return true;
  });

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Investment Management</h2>

        {/* Tabs */}
        <div className="flex gap-2 bg-zinc-900 p-1 rounded-xl">
          {(['all', 'pending', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-amber-400 text-black' 
                  : 'text-gray-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInvestments.map((inv) => {
          const isPending = !inv.isActive;
          const isActive = isTransactionActive(inv);
          const isCompleted = isTransactionComplete(inv);

          return (
            <div 
              key={inv._id}
              className="bg-zinc-900 border border-gray-700 rounded-3xl p-6 hover:border-amber-400/50 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{inv.plan}</h3>
                  <p className="text-gray-400 text-sm">
                    {inv.duration} {inv.durationFlag}
                  </p>
                </div>

                <Badge 
                  className={`${
                    isPending ? 'bg-yellow-500/10 text-yellow-400' :
                    isActive ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}
                >
                  {isPending ? 'Pending' : isActive ? 'Active' : 'Completed'}
                </Badge>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-gray-400 text-xs">Customer</p>
                  <p className="text-white font-medium">{inv.customer}</p>
                  <p className="text-gray-500 text-sm">{inv.email}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Amount Invested</p>
                  <p className="text-2xl font-bold text-white">${inv.amount.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Start Date</p>
                    <p className="text-white">
                      {new Date(inv.investmentDate).toLocaleDateString()+" "+inv.investmentDate.toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Withdrawal Code</p>
                    <p className="font-mono text-amber-400">{inv.withdrawalCode || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Confirm Deposit - Only for Pending */}
                {isPending && (
                  <Button 
                    onClick={() => onConfirmDeposit(inv._id)}
                    disabled={loading}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-black"
                  >
                    {loading && <Loader2 className="animate-spin mr-1" />}
                    Confirm Deposit Received
                  </Button>
                )}

                {/* Add Profit - Only for Active */}
                {isActive && (
                  <Button 
                    onClick={() => onAddProfit(inv._id)}
                    variant="outline"
                    className="w-full border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Add Profit / Update Balance
                  </Button>
                )}

                {/* Confirm Upgrade Fee - Only after duration elapsed */}
                {isCompleted && (
                  <Button 
                    onClick={() => onConfirmUpgradeFee(inv._id)}
                    variant="outline"
                    className="w-full border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
                  >
                    Confirm Upgrade Fee Paid
                  </Button>
                )}

                {/* Confirm Withdrawal - Only after upgrade fee */}
                {isActive && inv.withdrawalCode && (
                  <Button 
                    onClick={() => onConfirmWithdrawal(inv._id)}
                    variant="outline"
                    className="w-full border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Withdrawal Received
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {investments.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          No investments found.
        </div>
      )}
    </div>
    
  );
}