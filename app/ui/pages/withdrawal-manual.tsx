'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { Loader2, Trash2 } from 'lucide-react';
import { FormWrapper, GenerateFormdata, NumberFormat, useFormState } from '@imadehidiame/react-form-validation';
import { useParams, useRouter } from 'next/navigation';
import { Toasting } from '../lib/loader/loading-anime';
import SectionWrapper from '../components/section-wrapper';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';




interface WalletAddresses{
  currency:string,
  address:string,
  label:string
}
interface WithdrawalInfo {
  method:'bank'|'crypto',
  withdrawal:{
    currency:string,
    address: string
  }|{
    name:string,
    country:string,
    bank:string,
    swift_code:string,
    account_number:string
  },
  amount:number,
  stage:number,
  id:string
}



interface PageProps {
    wallets:WalletAddresses[];
    withdrawal?:WithdrawalInfo;
    //userWallets:WalletAddress[];
    //investmentDetails:InvestmentInfo;
    balance:number;
    kyc:{
      name:string,
      country:string
    },
    withdrawals:{
        amount:number,
        stage:number,
        method:string,
        date:Date|string
    }[]
}



const WithdrawalManual: React.FC<PageProps> = ({withdrawal,balance,wallets,kyc,withdrawals}) => {
    

    const [pageBalance,setPageBalance] = useState<number>(balance);
    const [pageWallets,setPageWallets] = useState<WalletAddresses[]>(wallets);
    const [pageWithdrawal,setPageWithdrawal] = useState<WithdrawalInfo|undefined>(withdrawal);
    const [pageWithdrawals,setPageWithdrawals] = useState(withdrawals);
    const [openDialog,setOpenDialog] = useState(false);
    const [deleteLoading,setDeleteLoading] = useState(false);
    const errorMessage = pageWithdrawal ? pageWithdrawal.stage === 1 ? `Dear ${kyc.name}, your account has exceeded the minimum threshold for your account type. Your trading account requires a compulsory account upgrade to process your withdrawal` : pageWithdrawal.stage === 2 ? `Dear ${kyc.name}, you are going to need a withdrawl code to proced with your withdrawal` : '' : ''; 
    
    const navigation = useFormState();
     const loading = navigation === 'submit';
    const router = useRouter();

     const withdrawalFormSchema = z.object({
        //investmentId: z.string(), // Hidden field

        amount: z.string().min(1, { message: 'Please enter the withdrawal amount' })/*
        .positive({ message: 'Amount must be positive' }).max(investmentDetails.max_withdrawal{message:`Value cannot be greater than ypur ROI + investment amount ($${max_withdrawal})`})*//*.refine((e)=>{
            let amount = parseFloat(e.replaceAll(',',''));
            return amount > 0 && amount <= investmentDetails.max_withdrawal ? true : false; 
            //return true;
        },{message:`Value cannot be greater than your ROI + investment amount ($${max_withdrawal})`})*/,
        currency: z.string().min(1, { error: 'Please select a wallet type' }),
        address: z.string().nonempty({error:'Please enter the wallet address'}),
        method: z.string().nonempty({error:'Please select a withdrawal method'}),
        name:z.string().nonempty({error:'Please enter the account name'}),
        country:z.string().nonempty({error:'Please enter your country'}),
        bank:z.string().nonempty({error:'Please enter the name of your bank'}),
        swift_code:z.string().nonempty({error:'Please enter the swift code of your bank'}),
        account_number:z.string().nonempty({error:'Please enter your bank account number'}),
        withdrawalCode: z.string().nonempty({error:'Please enter the withdrawal code for this transaction. You might want to contact support via Messaging for this'}),
      });

      const getStageLabel = (stage: number, method: string) => {
        if (stage === 1) return { label: 'Pending Approval', color: 'bg-yellow-500' };
        if (stage === 2) return { label: 'Code Required', color: 'bg-blue-500' };
        if (stage === 3) return { label: 'Processing', color: 'bg-purple-500' };
        if (stage === 4) return { label: 'Completed', color: 'bg-green-500' };
        if (stage === 5) return { label: 'Cancelled', color: 'bg-red-500' };
        return { label: 'Unknown', color: 'bg-gray-500' };
      };

      const { amount,currency,address,method,name,country,bank,swift_code,account_number,withdrawalCode } = withdrawalFormSchema.shape;
      const editCurrency = pageWithdrawal && pageWithdrawal.withdrawal as {currency:string,address:string};
      const editBank = pageWithdrawal && pageWithdrawal.withdrawal as {
        name:string,
        country:string,
        bank:string,
        swift_code:string,
        account_number:string
      };
      const disableForm = pageWithdrawal && (pageWithdrawal.stage >=1 && pageWithdrawal.stage < 3) ? true : false
      const cryptoForm = [
        (new GenerateFormdata)
                         .set_class_names('w-full')
                         .set_label('Wallet Option')
                         //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
                         .set_label_class_names('text-amber-300 mb-4')
                         .set_name('wallet_option')
                         .set_disabled(loading)
                         .set_selects([...pageWallets.map(e=>({name:e.label,value:`${e.currency.toLocaleLowerCase().includes('bitcoin') ? 'btc':'eth'}|${e.address}`})),{
                          name:'Enter crypto wallet information',
                          value:'manual'
                         }])
                         .set_placeholder('Select from registered wallets or enter wallet details')
                         .set_type('select')
                         .set_validation(z.string().optional())
                         .set_value('')
                         .set_field_class_names(
                           'w-full bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                         )
                         .set_error_field_class_names('text-red-500 text-sm mt-1')
                         .build(),
                         (new GenerateFormdata)
                         .set_class_names('w-full')
                         .set_label('Wallet Type')
                         //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
                         .set_label_class_names('text-amber-300 mb-4')
                         .set_name('currency')
                         .set_disabled(disableForm)
                         .set_selects(editCurrency && editCurrency.currency ? [
                          {
                          name:'Bitcoin',
                          value:'btc'
                          },
                          {
                            name:'Ethereum',
                            value:'eth'
                          }
                        ].filter(e=>e.value === editCurrency.currency):[
                          {
                          name:'Bitcoin',
                          value:'btc'
                          },
                          {
                            name:'Ethereum',
                            value:'eth'
                          }
                        ])
                         .set_placeholder('Select from registered wallets or enter wallet details')
                         .set_type('select')
                         .set_validation(currency)
                         .set_value(editCurrency && editCurrency.currency ? editCurrency.currency : '')
                         .set_field_class_names(
                           'w-full bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                         )
                         .set_error_field_class_names('text-red-500 text-sm mt-1')
                         .build(),  
                                          new GenerateFormdata()
                                           .set_class_names('w-full')
                                           .set_label('Wallet Address')
                                           .set_label_class_names('text-amber-300 mb-4')
                                           .set_name('address')
                                           .set_disabled(disableForm)
                                           .set_placeholder('Enter your wallet address')
                                           .set_validation(address)
                                           .set_value(editCurrency && editCurrency.address ? editCurrency.address : '')
                                           .set_field_class_names(
                                             'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                                           )
                                           .set_error_field_class_names('text-red-500 text-sm mt-1')
                                           .build(),                       
        
      ];

      const bankForm = [
        new GenerateFormdata()
                                           .set_class_names('w-full')
                                           .set_label('Name')
                                           .set_label_class_names('text-amber-300 mb-4')
                                           .set_name('name')
                                           .set_disabled(true)
                                           .set_placeholder('Your account name')
                                           .set_validation(name)
                                           .set_value(kyc.name)
                                           .set_field_class_names(
                                             'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                                           )
                                           .set_error_field_class_names('text-red-500 text-sm mt-1')
                                           .build(),
                                           new GenerateFormdata()
                                           .set_class_names('w-full')
                                           .set_label('Country')
                                           .set_label_class_names('text-amber-300 mb-4')
                                           .set_name('country')
                                           .set_disabled(true)
                                           .set_placeholder('Your country')
                                           .set_validation(country)
                                           .set_value(kyc.country)
                                           .set_field_class_names(
                                             'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                                           )
                                           .set_error_field_class_names('text-red-500 text-sm mt-1')
                                           .build(),  
                                           new GenerateFormdata()
                                           .set_class_names('w-full')
                                           .set_label('Bank Name')
                                           .set_label_class_names('text-amber-300 mb-4')
                                           .set_name('bank')
                                           .set_disabled(disableForm)
                                           .set_placeholder('Enter your bank name')
                                           .set_validation(bank)
                                           .set_value(editBank && editBank.bank ? editBank.bank : '')
                                           .set_field_class_names(
                                             'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                                           )
                                           .set_error_field_class_names('text-red-500 text-sm mt-1')
                                           .build(),
                                           new GenerateFormdata()
                                           .set_class_names('w-full')
                                           .set_label('Swift Code')
                                           .set_label_class_names('text-amber-300 mb-4')
                                           .set_name('swift_code')
                                           .set_disabled(disableForm)
                                           .set_placeholder(`Enter your bank's swift code`)
                                           .set_validation(swift_code)
                                           .set_value( editBank && editBank.swift_code ? editBank.swift_code : '')
                                           .set_field_class_names(
                                             'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                                           )
                                           .set_error_field_class_names('text-red-500 text-sm mt-1')
                                           .build(), 
                                           new GenerateFormdata()
                                           .set_class_names('w-full')
                                           .set_label('Account Number')
                                           .set_label_class_names('text-amber-300 mb-4')
                                           .set_name('account_number')
                                           .set_disabled(disableForm)
                                           .set_placeholder('Enter your account number')
                                           .set_validation(account_number)
                                           .set_value(editBank && editBank.account_number ? editBank.account_number : '')
                                           .set_field_class_names(
                                             'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                                           )
                                           .set_error_field_class_names('text-red-500 text-sm mt-1')
                                           .build(),                                        
      ]

      let additional = pageWithdrawal ? pageWithdrawal.method === 'bank' ? [...bankForm] : [...cryptoForm.slice(1)] : []
      additional = pageWithdrawal ? pageWithdrawal.stage === 2 ? [...additional,...[new GenerateFormdata()
        .set_class_names('w-full')
        .set_label('Withdrawal Code')
        .set_label_class_names('text-amber-300 mb-4')
        .set_name('withdrawalCode')
        .set_disabled(false)
        .set_placeholder('Withdrawal code for this transaction')
        .set_validation(withdrawalCode)
        .set_value('')
        .set_field_class_names(
          'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
        )
        .set_error_field_class_names('text-red-500 text-sm mt-1')
        .build()]] : [...additional] : [...additional];  
      

    
    const form_data = [
      new GenerateFormdata()
      .set_class_names('w-full')
      .set_label('Account Balance')
      .set_label_class_names('text-amber-300 mb-4')
      .set_name('balance')
      .set_disabled(true)
      .set_placeholder('Account balance')
      .set_validation(z.string().optional())
      .set_value('$'+balance.toLocaleString())
      .set_field_class_names(
        'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
      )
      .set_error_field_class_names('text-red-500 text-sm mt-1')
      .build(),
        (new GenerateFormdata)
                         .set_class_names('w-full')
                         .set_label('Withdrawal Amount (USD)')
                         //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
                         .set_label_class_names('text-amber-300 mb-4')
                         .set_name('amount')
                         .set_disabled(disableForm)
                         //.set_disabled(is_submitting)
                         .set_placeholder('Please enter withdrawal amount')
                         .set_type('float')
                         .set_validation(amount)
                         .set_flag({allow_decimal:true,allow_zero_start:false,length_after_decimal:2,add_if_empty:false,format_to_thousand:true,allow_negative_prefix:false})
                         .set_value(pageWithdrawal ? pageWithdrawal.amount.toLocaleString() : '')
                         .set_field_class_names(
                           'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                         )
                         .set_error_field_class_names('text-red-500 text-sm mt-1')
                         .build(),
                         (new GenerateFormdata)
                         .set_class_names('w-full')
                         .set_label('Withdrawal Method')
                         //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
                         .set_label_class_names('text-amber-300 mb-4')
                         .set_name('method')
                         .set_disabled(disableForm)
                         .set_selects(pageWithdrawal ? [
                          {
                          name:'Bank Transfer',
                          value:'bank'
                          },
                          {
                            name:'Crypto',
                            value:'crypto'
                          }
                        ].filter(e=>e.value === pageWithdrawal.method):[
                          {
                          name:'Bank Transfer',
                          value:'bank'
                          },
                          {
                            name:'Crypto',
                            value:'crypto'
                          }
                        ])
                         .set_placeholder('Select your preferred withdrawal method')
                         .set_type('select')
                         .set_validation(method)
                         .set_value(pageWithdrawal ? pageWithdrawal.method : '')
                         .set_field_class_names(
                           'w-full bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                         )
                         .set_error_field_class_names('text-red-500 text-sm mt-1')
                         .build(),
                         
        /*get_form_data('select','currency','',currency,'Wallet Address','Please select your wallet address',undefined,undefined,undefined,userWallets,'w-full','bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'),
        get_form_data('float','amount','',amount,'Withdrawal Amount (USD)','Please enter withdrawal amount',undefined,undefined,undefined,undefined,'w-full','bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300',undefined,undefined,'text-gray-300',{allow_decimal:true,allow_zero_start:false,length_after_decimal:2,add_if_empty:false,format_to_thousand:true,allow_negative_prefix:false}),*/

        
        //get_form_data('text','label','',amount,'Label','e.g, My Bitcoin Wallet',undefined,undefined,undefined,undefined,'w-full','bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'),
    ];

    const [form_state,set_form_state] = useState([...form_data,...additional]);
    
    useEffect(()=>{
      if(pageWithdrawal){
      //console.log(`Page withdrawal update`);
      //console.log({pageWithdrawal});
      if(pageWithdrawal.stage === 3){

        router.refresh();

      }else{
        
        let editCurrency = pageWithdrawal.withdrawal as {
          currency:string,
          address:string
        }; 
        set_form_state(prev => {
          let returned = prev.filter(e => e.name !== 'wallet_option');
          if(pageWithdrawal!.method === 'crypto')
          returned = returned.slice().map(e=>(e.name==='currency'?
        {...e,selects:e.selects?.filter(f=>f.value === editCurrency.currency)}
        //: e.name === 'method' ? {...e,selects:e.selects?.filter(f=>f.value === pageWithdrawal.method)} 
        : e 
        ))
          returned = returned.slice().map(e=>(e.name === 'method' ? 
          {...e,selects:e.selects?.filter(f=>f.value === pageWithdrawal.method)}:e))
          return pageWithdrawal.stage ===1 ? returned.slice().map(e=>({...e,disabled:true}))
          : returned.slice().map(e=>(e.name === 'withdrawalCode' ? e : {...e,disabled:true}));
          ;
          //return prev.map(e=>({...e,disabled:true}));
        });

      }
      
      }
    },[pageWithdrawal]);

    const on_change_form = (name:string|number|Symbol,value:any)=>{
      if(name === 'method'){
        if(value === '')
        set_form_state(prev=>[...prev.slice(0,3)]);
        else if(value === 'bank')
        set_form_state(prev=>[...prev.slice(0,3),...bankForm]);
        else
        set_form_state(prev=>[...prev.slice(0,3),...cryptoForm]);
      }
      if(name === 'wallet_option'){
        if(value === 'manual')
          set_form_state(prev=>prev.map(e=>(e.name === 'currency' || e.name === 'address' ?
        {...e,value:''}
        :e
        )));
        else{
          const [currency,address] = (value as string).split('|');
          set_form_state(prev=>prev.map(e=>(e.name === 'currency' ? 
            {...e,value:currency} : 
            e.name === 'address' ? 
            {...e,value:address} : 
            e 
          )));
        }
      }
        //set_form_state(prev=>prev.map(e=>(e.name == name ? {...e,value} : e)));
    }

    

    const deleteWithdrawal = async () =>{
      if(pageWithdrawal){
        setDeleteLoading(true);
        try {
          const response = await fetch(`/api/withdrawal/cancel/${pageWithdrawal.id}`,{
            method:'DELETE',
            headers:{
              'X-WITH-CANCEL-ID':pageWithdrawal.id
            }
          });
          setDeleteLoading(false);
          if(response.ok){
            Toasting.success('Withdrawal has been successfully terminated',50000);
            window.location.reload();
            //router.refresh();
          }else{
            const served = await response.json();
            const {statusText,status} = response;
            switch (status) {
              case 403:
                Toasting.error(served.error ? 
                  served.error : 
                  statusText ? statusText :
                  'You do not have the permission to perform this action',10000); 
                break;
                case 404:
                  Toasting.error(served.error ? 
                    served.error : 
                    statusText ? statusText :
                    'Resource could not be found on the server',10000); 
                  break;
              case 500:
                Toasting.error(served.error ? 
                  served.error : 
                  statusText ? statusText :
                  'An error occured on the server. Please try again later',10000); 
                break;
                default:
                Toasting.error(statusText ? statusText : 'An unknown error occured along the way',10000);
                break;
            }
          }  
        } catch (error) {
          setDeleteLoading(false);
          Toasting.error('An error occured along the way. Please try again later',10000);
        }finally{
          setDeleteLoading(false);
        }
      }
        //submit(form_value,{action:`/dashboard/withdrawal/request/${investment_id}`,encType:'application/json',method:'POST',replace:true});
    }

    const after_submit_action = async (message:string,data:any)=>{
        Toasting.success(message,10000);
        //console.log({data});
        if(data.served){
          const {
            balance,//: '$12,050',
            amount,//: '500,000',
            method,//: 'crypto',
            //wallet_option: 'btc|839373973937ab',
            currency,//: 'btc',
            address,//: '839373973937ab'
            name,//: 'Ehidiamen Ima',
      country,//: 'Nigeria',
      bank,//: 'My Bank',
      swift_code,//: '83938739983',
      account_number,//: '3927827278'
            id,
            stage,
          } = data.served;
          if(pageWithdrawal){
              setPageWithdrawal(prev=>({...prev!,stage}))
          }else{
            setPageWithdrawal(prev=>({
              amount,
              stage,
              id,
              method,
              withdrawal:method === 'bank' ? {
                account_number,
                swift_code,
                bank,
                country,
                name
              } : {
                currency,
                address
              }
            }));
          }
        }else{
          window.location.reload();
        }
        
        /*setPageWithdrawal({

        })*/
        //router.replace(`/dashboard/withdrawal`);
    }
    
    

    return (
      <SectionWrapper animationType='fadeInUp' padding='4' md_padding='4'>
        <div className="space-y-8 p-4 max-sm:p-2">
          
          {/* Withdrawal Form Section */}
          <CardTitle className="text-xl sm:text-2xl font-medium text-amber-300">Withdrawals</CardTitle>
          
          <Card className="bg-gray-800 py-4 px-2 border border-amber-300/50">
            <CardHeader className="max-sm:p-2">
              <CardTitle className="text-lg font-bold text-amber-300">Process Active Withdrawal</CardTitle>
            </CardHeader>
            <CardContent className="max-sm:p-2">
              <Card className="bg-gray-800 p-6 border border-amber-300/50 max-w-lg mx-auto">
                {errorMessage && (
                  <Card className="bg-red-900/80 py-4 px-4 border border-red-400 mb-6">
                    <CardContent>
                      <p className="text-red-100 text-base">{errorMessage}</p>
                    </CardContent>
                  </Card>
                )}
  
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-amber-300">Withdrawal Details</CardTitle>
                </CardHeader>
  
                <CardContent className="space-y-4">
                  <FormWrapper
                    action={`/api/withdrawal/process`}
                    method={'POST'}
                    form_components={form_state}
                    set_form_elements={set_form_state}
                    is_json={true}
                    on_change={on_change_form}
                    pre_submit_action={(value) => {
                      if (pageWithdrawal) value['id'] = pageWithdrawal.id;
                      return value;
                    }}
                    redefine={({ amount }) => {
                      const valid = parseFloat((amount as string ?? '1').replaceAll(',', '')) <= pageBalance;
                      return {
                        valid,
                        error: valid ? '' : 'Amount must be less than current account balance',
                        path: 'amount'
                      };
                    }}
                    is_clear_form={false}
                    validation_mode="onChange"
                    class_names="space-y-6"
                    notify={(error) => Toasting.error(error, 10000, 'bottom-center')}
                    after_submit_action={after_submit_action}
                  >
                    {(!pageWithdrawal || pageWithdrawal.stage !== 1) && (
                      <Button type="submit" className="w-full bg-amber-300 text-gray-900 hover:bg-amber-400" disabled={loading}>
                        {loading && <Loader2 className="animate-spin mr-2" />}
                        {loading ? 'Processing...' : 'Process Withdrawal'}
                      </Button>
                    )}
                  </FormWrapper>
  
                  {(pageWithdrawal && (pageWithdrawal.stage === 1 || pageWithdrawal.stage === 2)) && (
                    <Dialog onOpenChange={setOpenDialog} open={openDialog}>
                    <DialogTrigger asChild>
                        
                    <Button 
                      type="button"
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                      disabled={loading}
                      onClick={()=>{
                        setOpenDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancel Withdrawal
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 text-gray-100 border-amber-300/50">
                        <DialogHeader>
                            <DialogTitle className="text-white">Are you sure?</DialogTitle>
                            <DialogDescription className="text-gray-300">
                                This action cannot be undone and it will permanently cancel the withdrawal process already initiated.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            
                                
                                <Button type="button" onClick={deleteWithdrawal} className="bg-red-500 text-white hover:bg-red-600" disabled={deleteLoading}>
                                {deleteLoading && <Loader2 className="animate-spin" />}
                                    {deleteLoading  ? 'Processing...' : 'Continue'}
                                </Button>
                                
                            {/*</Form>*/}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                    
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
  
          {/* ====================== WITHDRAWALS HISTORY ====================== */}
          <Card className="bg-gray-800 border border-amber-300/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-amber-300">Withdrawal History</CardTitle>
              <p className="text-sm text-gray-400">All your past and active withdrawal requests</p>
            </CardHeader>
            <CardContent className="max-sm:p-2">
              
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-900/70 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 font-medium text-amber-300">Date</th>
                      <th className="px-6 py-4 font-medium text-amber-300">Method</th>
                      <th className="px-6 py-4 font-medium text-amber-300 text-right">Amount (USD)</th>
                      <th className="px-6 py-4 font-medium text-amber-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {pageWithdrawals.length > 0 ? (
                      pageWithdrawals.map((wd, index) => {
                        const stageInfo = getStageLabel(wd.stage, wd.method);
                        return (
                          <tr key={index} className="hover:bg-gray-700/50">
                            <td className="px-6 py-4 text-gray-300">
                              {new Date(wd.date).toLocaleDateString('en-US', { 
                                year: 'numeric', month: 'short', day: 'numeric' 
                              })}
                            </td>
                            <td className="px-6 py-4 capitalize text-gray-300">
                              {wd.method}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-amber-300">
                              ${NumberFormat.thousands(wd.amount.toFixed(2), { 
                                add_if_empty: true, 
                                allow_decimal: true 
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${stageInfo.color}`}>
                                {stageInfo.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          No withdrawal history yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
  
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {pageWithdrawals.length > 0 ? (
                  pageWithdrawals.map((wd, index) => {
                    const stageInfo = getStageLabel(wd.stage, wd.method);
                    return (
                      <Card key={index} className="bg-gray-900 border border-gray-700">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-gray-400">Date</p>
                              <p className="text-gray-200">
                                {new Date(wd.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', month: 'short', day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${stageInfo.color}`}>
                              {stageInfo.label}
                            </span>
                          </div>
  
                          <div>
                            <p className="text-xs text-gray-400">Method</p>
                            <p className="capitalize font-medium text-gray-100">{wd.method}</p>
                          </div>
  
                          <div>
                            <p className="text-xs text-gray-400">Amount</p>
                            <p className="text-xl font-semibold text-amber-300">
                              ${NumberFormat.thousands(wd.amount.toFixed(2), { 
                                add_if_empty: true, 
                                allow_decimal: true 
                              })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="bg-gray-900 border border-gray-700">
                    <CardContent className="p-10 text-center text-gray-400">
                      No withdrawal history yet
                    </CardContent>
                  </Card>
                )}
              </div>
  
            </CardContent>
          </Card>
  
        </div>
      </SectionWrapper>
    );
  };
  
  export default WithdrawalManual;