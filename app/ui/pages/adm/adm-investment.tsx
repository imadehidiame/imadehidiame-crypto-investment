'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toasting } from '../../lib/loader/loading-anime';
import SectionWrapper from '../../components/section-wrapper';
//import { FormNumberDefault, FormSelectDefault, NumberFormat } from '@imadehidiame/react-form-validation';
import { extract_date_time, fetch_request_mod } from '@/lib/utils';
import { IInvestmentAdmin } from '@/types';
import AdmInvestmentSection from '../../components/adm-investment-section';






interface PageProps {
  investments: IInvestmentAdmin[];
}

const AdmInvestment: React.FC<PageProps> = ({ investments }) => {
  //const navigation = useNavigation();
  //const submit = useSubmit();
  const [invs,setInvs] = useState<IInvestmentAdmin[]>(investments);
  const [loading,setLoading] = useState<boolean>(false);
  
  const confirmDeposit = async (id:string)=>{
    setLoading(true);
    const {served,data,is_error} = await fetch_request_mod<{logged:boolean}>('POST','/api/adm-investments/activate',JSON.stringify({id}));
    if(!is_error){
      if(served?.logged === true){
      setInvs(e=>e.map(e1=>({...e1,isActive:e1._id === id?true:e1.isActive,
        investmentDate:e1._id === id ? new Date(Date.now()):e1.investmentDate})));
        Toasting.success('Deposit activated successfully',10000,'bottom-center');
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
        <CardTitle className="text-xl sm:text-2xl font-medium text-amber-300">Account Deposit</CardTitle>

        <Card className="bg-gray-800 py-4 px-2 border border-amber-300/50">
          <CardHeader className="max-sm:p-2">
            <CardTitle className="text-lg font-bold text-amber-300">Create Deposit</CardTitle>
            <p className="text-sm text-gray-400">Make a deposit</p>
          </CardHeader>
          <CardContent className="max-sm:p-2">
            <AdmInvestmentSection 
                loading={loading}
                investments={invs}
                onAddProfit={(inv)=>{

                }}
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