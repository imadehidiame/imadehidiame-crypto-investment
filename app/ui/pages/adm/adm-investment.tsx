'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toasting } from '../../lib/loader/loading-anime';
import SectionWrapper from '../../components/section-wrapper';
import { fetch_request_mod } from '@/lib/utils';
import { IInvestmentAdmin } from '@/types';
import AdmInvestmentSection from '../../components/adm-investment-section';
import { useSocket } from '@/hooks/useSocket';






interface PageProps {
  investments: IInvestmentAdmin[];
}

const AdmInvestment: React.FC<PageProps> = ({ investments }) => {
  //const navigation = useNavigation();
  //const submit = useSubmit();
  const [invs,setInvs] = useState<IInvestmentAdmin[]>(investments);
  const [loading,setLoading] = useState<boolean>(false);
  const newSocket = useSocket({ 
    userId:'',
    role: 'sys',
    notification:'1' 
  },[
    {
      event:'receive_notification',
      handler(served_data:{
        flag:'activate_transaction'|'update_profit'|'new_subscription',
        data:IInvestmentAdmin
      }) {
            const {flag,data} = served_data;
            if(flag === 'new_subscription'){
              setInvs(prev=>[...prev,data]);
            }
      },
    }
  ])

  
  
  const onAddProfitHandler = (inv:{investmentId:string,userId:string,profit:number,flag:'profit'|'upgrade'})=>{
      const {flag,investmentId,userId:channel,profit} = inv;
      if(flag === 'profit'){
        newSocket?.emit('send_notification',{
          channel:`notification:${channel}`,
          flag:'update_profit',
          data:{ 
            profit,
            investmentId
          }
        });
        setInvs(e=>e.map(e1=>({...e1,profits:e1._id === investmentId?e1.profits+profit:e1.profits})));  
      }else if(flag==='upgrade'){
        setInvs(e=>e.map(e1=>({...e1,maxUpgrade:e1._id === investmentId?profit:e1.maxUpgrade!})));  
      }
  }

  const confirmDeposit = async (id:IInvestmentAdmin)=>{
    setLoading(true);
    const {served,data,is_error} = await fetch_request_mod<{logged:boolean}>('POST','/api/adm-investments/activate',JSON.stringify({id:id._id}));
    if(!is_error){
      if(served?.logged === true){
      const date = new Date(Date.now());
      setInvs(e=>e.map(e1=>({...e1,stage:e1._id === id._id?1:e1.stage,
        investmentDate:e1._id === id._id ? new Date(Date.now()):e1.investmentDate})));
        try {
          newSocket?.emit('send_notification',{
            channel:id.user,  
            flag:'activate_transaction',
            data:{
              stage:1,
              date,
              investmentId:id._id
            }
          });  
        } catch (error) {
          console.log(error);
        }finally{
          Toasting.success('Deposit activated successfully',10000,'bottom-center');
        }
      }else{
        Toasting.error('Invalid response from server',10000,'bottom-center')
      }
    }else{
      Toasting.error('An error occured along the way',10000,'bottom-center')
    }
    setLoading(false);
  }
  
  return (
    <SectionWrapper animationType="slideInRight" padding="0" md_padding="0">
      <div className="space-y-6 p-4 max-sm:p-2">
        <CardTitle className="text-xl sm:text-2xl font-medium text-amber-300">Subscriptions</CardTitle>

        <Card className="bg-gray-800 py-4 px-2 border border-amber-300/50">
          <CardHeader className="max-sm:p-2">
            <CardTitle className="text-lg font-bold text-amber-300">Manage Subscriptions</CardTitle>
            <p className="text-sm text-gray-400">Make a deposit</p>
          </CardHeader>
          <CardContent className="max-sm:p-2">
            <AdmInvestmentSection 
                loading={loading}
                investments={invs}
                onAddProfit={onAddProfitHandler}
                onConfirmDeposit={confirmDeposit}
                onConfirmUpgradeFee={(inv)=>{

                }}
                onConfirmWithdrawal={(inv)=>{

                }}
            />
          </CardContent>
        </Card>
        </div>
    </SectionWrapper>
  );
};

export default AdmInvestment;