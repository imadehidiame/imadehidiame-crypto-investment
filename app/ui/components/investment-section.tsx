'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, ArrowRight, Wallet } from 'lucide-react';
import Link from 'next/link';
import { IInvestment } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import WalletAddresses from './wallet-address';
import SectionWrapper from './section-wrapper';
import { Socket,io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
//import { IInvestment } from '@/app/types';
//import { IInvestment } from '@/types';

interface InvestmentSectionProps {
  userId:string;
  investments: IInvestment[];
  wallets:{
    btc:string,
    eth:string
  }
}

const HOUR_IN_SECONDS = 60 * 60;
const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24;
const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7;


const isValidTransaction = (investment:IInvestment)=>{
  const additionalDate = new Date(investment.investmentDate).getTime() + ((investment.durationFlag == 'days' ? 
    (investment.duration * DAY_IN_SECONDS) : (investment.duration * HOUR_IN_SECONDS))*1000);
  return new Date(additionalDate) > new Date(Date.now());
  /*return parseInt((investment.investmentDate.getTime()/1000).toString()) + (investment.durationFlag == 'days' ? 
    (investment.duration * DAY_IN_SECONDS) : (investment.duration * HOUR_IN_SECONDS)) < 
    parseInt(((new Date).getTime()/1000).toString());*/
}

const isTransactionActive = (investment:IInvestment) => {
  return investment.stage >=1 && isValidTransaction(investment)
}

const isTransactionComplete = (investment:IInvestment) => {
  return investment.stage >= 1 && !isValidTransaction(investment)
}


export default function InvestmentSection({ 
  investments, 
  wallets,
  userId
}: InvestmentSectionProps) {

  const [openDialog,setOpenDialog] = useState<boolean>(false);
  const [amount,setAmount] = useState<number>(0);
  const [id,setId] = useState<string>('');
  const [invs,setInvs] = useState<IInvestment[]>(investments);

  const [newSocket,setNewSocket] = useState<Socket>();
  
      useEffect(()=>{
              const is_secure = location.protocol === 'https:';
              const localhost = 'localhost:3001';
              const ws_server = 'chat';
              const ws = is_secure ? `https://${ws_server}.cinvdesk.com` : `http://${localhost}`;
              const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || ws, {
                  query: { 
                    userId,
                    role: 'use',
                    notification:'1' 
                  },
                  // Recommended options for production
                  reconnection: true,
                  reconnectionAttempts: 5,
                  timeout: 10000,
                });
                setNewSocket(socket);
                socket.on('receive_notification',(served_data:{
                  data:{
                    stage:number,
                    date:Date,
                    profit:number,
                    investmentId:string,
                  }|any
                  flag:'activate_transaction'|'update_profit'|'new_subscription'
                })=>{
                  console.log('Notification received');
                  const {stage,date,investmentId,profit} = served_data.data;
                  const {flag} = served_data;
                  console.log({stage,date,investmentId,flag,profit});
                  console.log(served_data);
                  if(flag === 'activate_transaction')
                  setInvs(e=>(e.map(e1=>({...e1,stage:e1._id === investmentId ? stage : e1.stage}))))
                  else if(flag === 'new_subscription')
                    setInvs(prevInvs => [...prevInvs, served_data.data]);
                  else if(flag === 'update_profit')
                  setInvs(e=>(e.map(e1=>({...e1,profits:e1._id === investmentId ? e1.profits+profit : e1.profits}))))
                  /**
                   channel:id.user,
              flag:'activate_transaction',
              data:{
                stage:1,
                date,
                investmentId:id._id
              }
                   */
                  //setInvs([...invs,data]);
                });
                return ()=>{
                  socket.disconnect();
                }
        },[]);

        useEffect(()=>{
          console.log('Change detected');
          console.log({invs});
        },[invs])

  /**
   * 
   * 
   isValidTransaction = parseInt(investmentDate.getCurrentTime()/1000) + (durationFlag == 'days' ? (duration * DAY_IN_SECONDS) : (duration * HOUR_IN_SECONDS)) < parseInt((new Date).getTime()/1000); 
   isTransactionActve = isActive && isValidTransaction;
   isTransactionComplete = isActive && !isValidTransaction;
   
   */

  // Separate investments by status
  const pending = invs.filter(inv => inv.stage === 0);
  const ongoing = invs.filter(isTransactionActive);
  const completed = invs.filter(isTransactionComplete);
  

  return (

   <SectionWrapper animationType='slideInRight' padding='0' md_padding='0'>
    
          <div className="space-y-8 p-4 max-sm:p-2">

          <CardTitle className="text-xl sm:text-2xl font-medium text-amber-300">Subscriptions</CardTitle>

<Card className="bg-gray-800 py-4 px-2 border border-amber-300/50">
  <CardHeader className="max-sm:p-2">
    <CardTitle className="text-lg font-bold text-amber-300">My Investments</CardTitle>
    <p className="text-sm text-gray-400">All My Current Investments</p>
  </CardHeader>
  <CardContent className="max-sm:p-2">

      {/* Pending Deposits */}
      {pending.length > 0 && (
  <div>
    <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
      <Wallet className="w-5 h-5" />
      Pending Deposits
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pending.map((inv) => (
        <div 
          key={inv._id} 
          className="bg-zinc-900 border border-amber-400/30 rounded-3xl p-6 hover:border-amber-400 transition-all"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">{inv.plan}</h3>
              <p className="text-gray-400 text-sm mt-1">
                {inv.duration} {inv.durationFlag}
              </p>
            </div>
            <Badge variant="secondary" className="bg-amber-400/10 text-amber-400">
              Pending
            </Badge>
          </div>

          <div className="mb-8">
            <p className="text-gray-400 text-sm">Amount to Deposit</p>
            <p className="text-3xl font-bold text-white mt-1">
              ${inv.amount.toLocaleString()}
            </p>
          </div>

          
          {/* Improved Responsive Dialog */}
<Dialog open={openDialog && id === inv._id} onOpenChange={setOpenDialog}>
  <DialogTrigger asChild>
    <Button 
      className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-6 text-lg"
      onClick={() => {
        setAmount(inv.amount);
        setOpenDialog(true);
        setId(inv._id);
      }}
    >
      Proceed with Deposit
    </Button>
  </DialogTrigger>

  <DialogContent className="bg-zinc-900 border border-amber-400/30 w-full max-w-[95%] sm:max-w-lg mx-auto rounded-3xl p-0 overflow-hidden">
    
    {/* Dialog Header */}
    <div className="px-6 pt-6 pb-4 border-b border-amber-400/10">
      <DialogTitle className="text-white text-xl font-semibold">
        Complete Your Deposit
      </DialogTitle>
      <DialogDescription className="text-gray-400 mt-2">
        Send exactly <span className="text-amber-400 font-medium">${inv.amount.toLocaleString()}</span> to one of the addresses below
      </DialogDescription>
    </div>

    {/* Wallet Addresses Content */}
    <div className="p-6 max-h-[70vh] overflow-y-auto">
      <WalletAddresses
        amount={amount}
        btcAddress={wallets.btc}
        ethAddress={wallets.eth}
      />
    </div>

    {/* Dialog Footer */}
    <div className="px-6 py-5 border-t border-amber-400/10 flex justify-end">
      <Button 
        type="button" 
        variant="outline"
        onClick={() => {
          setOpenDialog(false);
          setAmount(0);
          setId('');
        }}
        className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8"
      >
        Close
      </Button>
    </div>
  </DialogContent>
</Dialog>
        </div>
      ))}
    </div>
  </div>
)}

      {/* Ongoing Investments */}
      {ongoing.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Active Investments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoing.map((inv) => (
              <div key={inv._id} className="bg-zinc-900 border border-gray-700 rounded-3xl p-6">
                <div className="flex justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-white text-xl">{inv.plan}</h3>
                    <p className="text-gray-400 text-sm">
                      {inv.duration} {inv.durationFlag}
                    </p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400">Active</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-xs">Invested Amount</p>
                    <p className="text-2xl font-bold text-white">${inv.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Profit</p>
                    <p className="text-2xl font-bold text-white">${inv.profits.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Start Date</p>
                    <p className="text-white">
                      {inv.investmentDate ? new Date(inv.investmentDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Investments */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Completed Investments
          </h2>

          <div className="overflow-x-auto hidden md:block">
            <table className="w-full min-w-full bg-zinc-900 border border-gray-700 rounded-2xl overflow-hidden">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Plan</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Duration</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Profit</th>
                  {/*<th className="text-left py-4 px-6 text-gray-400 font-medium">Withdrawal Code</th>
                  ${inv.profits.toLocaleString()}
                  */}
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {completed.map((inv) => (
                  <tr key={inv._id} className="border-b border-gray-800 last:border-none hover:bg-zinc-800/50">
                    <td className="py-5 px-6 font-medium text-white">{inv.plan}</td>
                    <td className="py-5 px-6 text-white">${inv.amount.toLocaleString()}</td>
                    <td className="py-5 px-6 text-gray-400">
                      {inv.duration} {inv.durationFlag} 
                    </td>
                    <td className="py-5 px-6 text-gray-400">
                    ${inv.profits.toLocaleString()}
                    </td>
                    {/*<td className="py-5 px-6 font-mono text-amber-400">{inv.withdrawalCode}</td>*/}
                    <td className="py-5 px-6 text-right">
                      <Link href="/dashboard/withdrawal">
                        <Button variant="outline" size="sm" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black">
                          Withdraw
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

                            <div className="md:hidden space-y-4 px-0">
                                <SectionWrapper animationType="fadeInUp" padding="0" md_padding="0">
                                  {completed.map((inv) => (
                                    <Card key={inv._id} className="bg-gray-900 p-6 border border-gray-700">
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Plan</span>
                                          <span className="font-medium text-white">{inv.plan}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Invested</span>
                                          <span className="text-white">${inv.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Duration</span>
                                          <span className="text-white">{inv.duration} {inv.durationFlag}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Profit</span>
                                          <span className="text-white">{inv.profits.toLocaleString()}</span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                        <Link href="/dashboard/withdrawal">
                        <Button variant="outline" size="sm" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black">
                          Withdraw
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                                        </div>
                                        
                                      </div>
                                    </Card>
                                  ))}
                                  </SectionWrapper>
                                </div>

        </div>
      )}

      {investments.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No investments found yet.
        </div>
      )}


  </CardContent>
  </Card>

      
    </div>
    </SectionWrapper>
  );
}