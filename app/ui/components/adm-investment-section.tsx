'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, DollarSign, Clock, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { IInvestmentAdmin } from '@/types';
import SectionWrapper from './section-wrapper';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormWrapper, GenerateFormdata, useFormState } from '@imadehidiame/react-form-validation';
import z from 'zod';
import { Toasting } from '../lib/loader/loading-anime';

interface InvestmentManagementProps {
  investments: IInvestmentAdmin[];
  onConfirmDeposit: (investmentId: IInvestmentAdmin) => void;
  onAddProfit: (data:{investmentId: string,profit:number,userId:string,flag:'profit'|'upgrade'}) => void;
  onConfirmUpgradeFee: (investmentId: string) => void;
  onConfirmWithdrawal: (investmentId: string) => void;
  loading:boolean;
}

const HOUR_IN_SECONDS = 60 * 60;
const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24;
const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7;


const isValidTransaction = (investment:IInvestmentAdmin)=>{
  const additionalDate = new Date(investment.investmentDate).getTime() + ((investment.durationFlag == 'days' ? 
    (investment.duration * DAY_IN_SECONDS) : (investment.duration * HOUR_IN_SECONDS))*1000);
  return new Date(additionalDate) > new Date(Date.now());
  /*return parseInt((investment.investmentDate.getTime()/1000).toString()) + (investment.durationFlag == 'days' ? 
    (investment.duration * DAY_IN_SECONDS) : (investment.duration * HOUR_IN_SECONDS)) < 
    parseInt(((new Date).getTime()/1000).toString());*/
}

const isTransactionActive = (investment:IInvestmentAdmin) => {
  return investment.stage >=1 && isValidTransaction(investment)
}

const isTransactionComplete = (investment:IInvestmentAdmin) => {
  return investment.stage >=1 && !isValidTransaction(investment)
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
  const [openDialog,setOpenDialog] = useState<boolean>(false);
  const [id,setId] = useState<string>('');

  const validation = z.object({
          profit:z.string().nonempty({message:'Enter the profit amount'})/*.refine((e)=>{
                  return plans.length > 0 ? (parseFloat(e.replaceAll(',','')) >= min!) && (parseFloat(e.replaceAll(',','')) <= max!) :  parseFloat(e) > 0;
                  //return false;
              },{message: !initialSelectedPlan ? '' : 'Value must be a number greater than or equal to the lowest minimum investment amount $'+NumberFormat.thousands(min!,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:true})+ 
                ' and less than or equal to the maximum investment amount of $'+ NumberFormat.thousands(max!,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:true})+' for the selected package'})*/,
      });

      const validationReinvest = z.object({
        maxUpgrade:z.string().nonempty({message:'Enter the amount user has to reinvest'})/*.refine((e)=>{
                return plans.length > 0 ? (parseFloat(e.replaceAll(',','')) >= min!) && (parseFloat(e.replaceAll(',','')) <= max!) :  parseFloat(e) > 0;
                //return false;
            },{message: !initialSelectedPlan ? '' : 'Value must be a number greater than or equal to the lowest minimum investment amount $'+NumberFormat.thousands(min!,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:true})+ 
              ' and less than or equal to the maximum investment amount of $'+ NumberFormat.thousands(max!,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:true})+' for the selected package'})*/,
    });
  
      const { profit } = validation.shape;
      const {maxUpgrade} = validationReinvest.shape;
      const navigation = useFormState();
      const loadingDialog = navigation === 'submit';
  const form_data = [
    (new GenerateFormdata)
                 .set_class_names('w-full')
                 .set_label('Profit (USD)')
                 //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
                 .set_label_class_names('text-amber-300 mb-4')
                 .set_id('profit')
                 .set_name('profit')
                 .set_disabled(loading)
                 //.set_disabled(is_submitting)
                 .set_placeholder('Enter the profit amount')
                 .set_type('float')
                 .set_flag({
                  allow_decimal:false,
                  allow_zero_start:false,
                  format_to_thousand:true
                 })
                 .set_validation(profit)
                 .set_value('')
                 /*.set_field_class_names(
                   'bg-white text-gray-900 border-green-300 focus:border-green-500 px-3 py-2 rounded-lg shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400'
                 )*/
                 .set_field_class_names(
                   'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                 )
                 .set_error_field_class_names('text-red-500 text-sm mt-1')
                 .build(),
];
const [form_state, set_form_state] = useState(form_data);

const reinvest = [
  (new GenerateFormdata)
               .set_class_names('w-full')
               .set_label('Reinvestment (USD)')
               //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
               .set_label_class_names('text-amber-300 mb-4')
               .set_id('max-upgrade')
               .set_name('maxUpgrade')
               .set_disabled(loading)
               //.set_disabled(is_submitting)
               .set_placeholder('Enter reinvestment amount')
               .set_type('float')
               .set_flag({
                allow_decimal:false,
                allow_zero_start:false,
                format_to_thousand:true
               })
               .set_validation(maxUpgrade)
               .set_value('')
               /*.set_field_class_names(
                 'bg-white text-gray-900 border-green-300 focus:border-green-500 px-3 py-2 rounded-lg shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400'
               )*/
               .set_field_class_names(
                 'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
               )
               .set_error_field_class_names('text-red-500 text-sm mt-1')
               .build(),
];
const [formReinvest, setFormReinvest] = useState(reinvest);



  const filteredInvestments = investments.filter(inv => {
    if (activeTab === 'pending') 
        return inv.stage === 0;
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
          const isPending = inv.stage === 0;
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
                      {new Date(inv.investmentDate).toLocaleDateString()+" "+new Date(inv.investmentDate).toLocaleTimeString('en-US', {
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
                    onClick={() => onConfirmDeposit(inv)}
                    disabled={loading}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-black"
                  >
                    {loading && <Loader2 className="animate-spin mr-1" />}
                    Confirm Deposit Received
                  </Button>
                )}

                {/* Add Profit - Only for Active */}
                {isActive && 
                  <Dialog open={openDialog && id === inv._id} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                    <Button 
                    onClick={()=>{
                      setId(inv._id);
                      setOpenDialog(true);
                    }}
                    variant="outline"
                    className="w-full border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Add Profit / Update Balance
                  </Button>
                    </DialogTrigger>
                  
                    <DialogContent className="bg-zinc-900 border border-amber-400/30 w-full max-w-[95%] sm:max-w-lg mx-auto rounded-3xl p-0 overflow-hidden">
                      
                      {/* Dialog Header */}
                      <div className="px-6 pt-6 pb-4 border-b border-amber-400/10">
                        <DialogTitle className="text-white text-xl font-semibold">
                          Add Profit
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 mt-2">
                          Add profits <span className="text-amber-400 font-medium"></span> to investment
                        </DialogDescription>
                      </div>
                  
                      
                      <div className="p-6 max-h-[70vh] overflow-y-auto">
                        
                        <div className="space-y-4">
                                                    
                        
                        
                                                   <FormWrapper
                                                                                                     action="/api/adm-investments/profit"
                                                                                                     method={'POST'}
                                                                                                     form_components={form_state}
                                                                                                     set_form_elements={set_form_state}
                                                                                                     is_json={true}
                                                                                                     request_headers={{
                                                                                                         //[CSRF_HEADER]: csrf_header!
                                                                                                     }}
                                                                                                     //fetch_options={/*{ credentials: 'include' }*/}
                                                                                                     pre_submit_action={(value) => {
                                                                                                        value['investmentId'] = inv._id;
                                                                                                        value['userId'] = inv.user;
                                                                              value['profit'] = parseFloat((value.profit as string ?? '1').replaceAll(',',''));
                                                                                                         return value;
                                                                                                     }}
                                                                                                     is_clear_form={true}
                                                                                                     validation_mode="onChange"
                                                                                                     class_names="space-y-6"
                                                                                                     notify={(error)=>{
                                                                                                       Toasting.error(error,10000,'bottom-center');
                                                                                                     }}
                                                                                                     after_submit_action={(message,data)=>{

                                                                                                        console.log(data);
                                                                                        onAddProfit({
                                                                                          investmentId:id,
                                                                                          userId:inv.user,
                                                                                          profit:data.profit as number,
                                                                                          flag:'profit'
                                                                                        });
                                                                                                        Toasting.success(message,
                                                                                                         10000,'bottom-center'
                                                                                                        );
                                                                                                        
                                                                                                     }}
                                                                         
                                                                                                 >
                                                        <Button className="bg-amber-300 text-gray-900 hover:bg-amber-400 cursor-pointer" disabled={loading} type='submit'>
                                                            {loadingDialog && <Loader2 className="animate-spin" />}
                                                            {loadingDialog ? 'Submitting..' : 'Submit'}
                                                        </Button>
                                                                                   
                                                                      {/*<Button variant="outline" className={"border-gold-500 border-amber-300 text-amber-300 hover:border-amber-50 hover:text-amber-50 cursor-pointer"} disabled={loading}>
                                                                           {loading  ? 'Saving...' : 'Save Changes'}
                                                                      </Button>*/}
                                                                                                     
                                                    </FormWrapper>     
                        
                                                    
                        
                                                    
                                                </div>


                      </div>



                      <div className="px-6 pt-6 pb-4 border-b border-amber-400/10">
                        <DialogTitle className="text-white text-xl font-semibold">
                          Update Maximum Upgrade Amount
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 mt-2">
                          Update the amount <span className="text-amber-400 font-medium"></span> users will be asked to reinvest
                        </DialogDescription>
                      </div>
                  
                      
                      <div className="p-6 max-h-[70vh] overflow-y-auto">
                        
                        <div className="space-y-4">
                                                    
                        
                        
                                                   <FormWrapper
                                                        action="/api/adm-investments/reinvest"
                                                                                                     method={'POST'}
                                                                                                     form_components={formReinvest}
                                                                                                     set_form_elements={setFormReinvest}
                                                                                                     is_json={true}
                                                                                                     request_headers={{
                                                                                                         //[CSRF_HEADER]: csrf_header!
                                                                                                     }}
                                                                                                     //fetch_options={/*{ credentials: 'include' }*/}
                                                                                                     pre_submit_action={(value) => {
                                                                                                        value['investmentId'] = inv._id;
                                                                                                        value['userId'] = inv.user;
                                                                              value['maxUpgrade'] = parseFloat((value.maxUpgrade as string ?? '1').replaceAll(',',''));
                                                                                                         return value;
                                                                                                     }}
                                                                                                     is_clear_form={true}
                                                                                                     validation_mode="onChange"
                                                                                                     class_names="space-y-6"
                                                                                                     notify={(error)=>{
                                                                                                       Toasting.error(error,10000,'bottom-center');
                                                                                                     }}
                                                                                                     after_submit_action={(message,data)=>{

                                                                                                        console.log(data);
                                                                                        onAddProfit({
                                                                                          investmentId:id,
                                                                                          userId:inv.user,
                                                                                          profit:data.maxUpgrade, 
                                                                                          flag:'upgrade'
                                                                                        });
                                                                                                        Toasting.success(message,
                                                                                                         10000,'bottom-center'
                                                                                                        );
                                                                                                        
                                                                                                     }}
                                                                         
                                                                                                 >
                                                        <Button className="bg-amber-300 text-gray-900 hover:bg-amber-400 cursor-pointer" disabled={loading} type='submit'>
                                                            {loadingDialog && <Loader2 className="animate-spin" />}
                                                            {loadingDialog ? 'Submitting..' : 'Submit'}
                                                        </Button>
                                                                                   
                                                                      {/*<Button variant="outline" className={"border-gold-500 border-amber-300 text-amber-300 hover:border-amber-50 hover:text-amber-50 cursor-pointer"} disabled={loading}>
                                                                           {loading  ? 'Saving...' : 'Save Changes'}
                                                                      </Button>*/}
                                                                                                     
                                                    </FormWrapper>     
                        
                                                    
                        
                                                    
                                                </div>


                      </div>


                  
                      {/* Dialog Footer */}
                      <div className="px-6 py-5 border-t border-amber-400/10 flex justify-end">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setOpenDialog(false);
                            //setAmount(0);
                            setId('');
                          }}
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8"
                        >
                          Close
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                }
                {/*isActive && (
                  <Button 
                    onClick={() => onAddProfit(inv._id)}
                    variant="outline"
                    className="w-full border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Add Profit / Update Balance
                  </Button>
                )*/}

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