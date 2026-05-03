'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { FormElement, FormWrapper, GenerateFormdata, NumberFormat, useFormState } from '@imadehidiame/react-form-validation';
import SectionWrapper from '../components/section-wrapper';
import { Toasting } from '../lib/loader/loading-anime';
import WalletAddresses from '../components/wallet-address';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import SubscriptionPlan from '../components/subscription-plan';
import { useSocket } from '@/hooks/useSocket';


// Define schema for investment form
/*const investmentSchema = z.object({
  planId: z.string({ error: 'Please select a plan' }), // Hidden input or passed via state/params
  amount: z.number({ error: 'Investment amount is required' }).positive({ message: 'Amount must be positive' }),
});*/

//type InvestmentFormValues = z.infer<typeof investmentSchema>;



interface IPlans {
    name:string;
    min:number;
    max:number;
    durationFlag:'Days'|'Hours';
    duration:number;
    packages?:string[];
}
type SubscriptionData = IPlans[];

interface PageProps {
  userData:{name:string,email:string,user:string};
  plans:SubscriptionData;
  initialSelectedPlan?: IPlans;
  wallets:{
    btc:string,
    eth:string,
  }
  /*balance: number;
  account_info:{
    earnings:number,
    investments:number
  }*/
}



const SubscribeManualPage: React.FC<PageProps> = ({plans,initialSelectedPlan,wallets,userData}) => {
    //const {  plans, initialSelectedPlan } = useLoaderData<typeof loader>();
     //const actionData = useActionData<typeof action>();
     
     
    const paymentDiv = useRef<HTMLDivElement>(null);
     const navigation = useFormState();
     const loading = navigation === 'submit';
     
    const {prices:cryptoPrices,error} = useCryptoPrices();

    const [selectedPlan, setSelectedPlan] = useState<IPlans | undefined>(initialSelectedPlan);
    const {min,max} = selectedPlan || {min:0,max:0};
    const validation = z.object({
        amount:z.string().nonempty({message:'Enter the amount you would like to invest'})/*.refine((e)=>{
                return plans.length > 0 ? (parseFloat(e.replaceAll(',','')) >= min!) && (parseFloat(e.replaceAll(',','')) <= max!) :  parseFloat(e) > 0;
                //return false;
            },{message: !initialSelectedPlan ? '' : 'Value must be a number greater than or equal to the lowest minimum investment amount $'+NumberFormat.thousands(min!,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:true})+ 
              ' and less than or equal to the maximum investment amount of $'+ NumberFormat.thousands(max!,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:true})+' for the selected package'})*/,
    });

    const { amount } = validation.shape;
    const newSocket = useSocket({ 
      userId:userData.user,
      role: 'use',
      notification:'1' 
    },[]);

    useEffect(()=>{
            if(selectedPlan){
              setTimeout(()=>{
                paymentDiv.current?.scrollIntoView({
                  behavior:'smooth',
                })
              },1000);
            }
            
      },[]);


  const [isShowWWallet,setIsShowWallet] = useState<boolean>(false);
  const [payment,setPayment] = useState<number>(200);
  const [pageForm, setPageForm] = useState<FormElement<any>[]>([
             (new GenerateFormdata)
             .set_class_names('w-full')
             .set_label('Investment Amount (USD)')
             //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
             .set_label_class_names('text-amber-300 mb-4')
             .set_name('amount')
             .set_disabled(loading)
             //.set_disabled(is_submitting)
             .set_placeholder('Enter your investment amount')
             .set_type('float')
             .set_flag({
              allow_decimal:false,
              allow_zero_start:false,
              format_to_thousand:true
             })
             .set_validation(amount)
             .set_value('')
             /*.set_field_class_names(
               'bg-white text-gray-900 border-green-300 focus:border-green-500 px-3 py-2 rounded-lg shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400'
             )*/
             .set_field_class_names(
               'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
             )
             .set_error_field_class_names('text-red-500 text-sm mt-1')
             .build(),
             
             ]);


     //const on_submit = async (form_values:any)=>{
       // const {duration,name:plan_name,id:plan,dailyReturn}  = selectedPlan!;
        //submit(Object.assign({},form_values,{duration,plan_name,plan,dailyReturn}),{action:'/dashboard/subscribe',encType:'application/json',method:'POST',replace:true});
    // }

    const pushNotification = (useD:any,admD:any)=>{
      console.log({admD,useD});
                                                                  try {
                                                                    newSocket?.emit('send_notification',{
                                                                      data:useD,
                                                                      flag:'new_subscription',
                                                                      channel:'notification:'+userData.user
                                                                    });
                                                                    newSocket?.emit('send_notification',{
                                                                      data:admD,
                                                                      flag:'new_subscription',
                                                                      channel:'notification:system'
                                                                    });  
                                                                  } catch (error) {
                                                                    console.log(error);
                                                                  }
    }

  return (
    <SectionWrapper animationType='slideInRight' padding='0' md_padding='0'>
    <div className="space-y-8 p-6">
      {/*<h1 className="text-3xl md:text-4xl font-medium text-amber-300">Subscribe to a Plan</h1>*/}
      <CardTitle className="text-2xl font-medium text-amber-300">Subscribe to a Plan</CardTitle>

      {/* Plan Selection */}
      <SubscriptionPlan isAuthPage={true} plans={plans} onSelect={()=>{
        setIsShowWallet(false);
        setTimeout(()=>{
          paymentDiv.current?.scrollIntoView({
            behavior:'smooth',
          })
        },1000);
      }} selectedPlan={selectedPlan} setPlan={setSelectedPlan} />
      
      
      {isShowWWallet && <WalletAddresses 
        btcAddress={wallets.btc}
        ethAddress={wallets.eth}
        amount={payment}
      />}

      {/* Investment Form */}
      {selectedPlan && (
        <Card className="bg-gray-800 p-6 border border-amber-300/50" ref={paymentDiv}>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-amber-300">Invest in {selectedPlan.name}</CardTitle>
             <p className="text-sm text-gray-50">Investment Range: ${selectedPlan.min} - ${selectedPlan.max}</p>
             {/*<p className="text-sm text-gray-400">Total Investable Balance: <span className='text-amber-300'>${account_data.balance}</span></p>
             <p className="text-sm text-gray-400">Running Investments: <span className='text-amber-300'>${account_data.investments}</span></p>
             <p className="text-sm text-gray-400">Current Investable Balance: <span className='text-amber-300'>${account_data.investable}</span></p>*/}
          </CardHeader>
          <CardContent>

            <FormWrapper
                                                              action="/api/subscribe"
                                                              method="POST"
                                                              fetch_options={{
                                                                credentials:'include'
                                                              }}
                                                              on_change={(on_update,value)=>{
                                                                setPageForm(prev=>prev.map(form=>(form.name === on_update ? {...form,value} : form)));
                                                              }}
                                                              is_clear_form={true}
                                                              form_components={pageForm}
                                                              set_form_elements={setPageForm}
                                                              is_json={true}
                                                              request_headers={{
                                                                  //[CSRF_HEADER]: csrf_header!
                                                              }}
                                                              //fetch_options={/*{ credentials: 'include' } */}
                                                              pre_submit_action={(value) => {
                                                                  
                                                                  const {duration,durationFlag,name:plan}  = selectedPlan!;
                                                                  value['duration'] = duration;
                                                                  value['durationFlag'] = durationFlag;
                                                                  value['plan'] = plan;
                                                                  let amount = parseFloat((value.amount as string ?? '1').replaceAll(',',''));
                                                                  value['amount'] = amount;
                                                                  value['btc'] = NumberFormat.thousands((amount/cryptoPrices.btc),{allow_decimal:true,length_after_decimal:15,add_if_empty:false,allow_zero_start:true});
                                                                  value['eth'] = NumberFormat.thousands((amount/cryptoPrices.eth),{allow_decimal:true,length_after_decimal:15,add_if_empty:false,allow_zero_start:true});
                                                                  setPayment(amount)
                                                                  setIsShowWallet(false);
                                                                  //value['plan'] = plan;
                                                                  //value['dailyReturn'] = dailyReturn;
        //submit(Object.assign({},form_values,{duration,plan_name,plan,dailyReturn}),{action:'/dashboard/subscribe',encType:'application/json',method:'POST',replace:true});
                                                                  return value;
                                                              }}
                                                              redefine={({amount})=>{
                                                                let { min:minInvestment,max:maxInvestment } = selectedPlan;
                                                                //console.log({amount,minInvestment,maxInvestment});
                                        const mod_amount = parseFloat((amount as string ?? '1').replaceAll(',',''));
                                        //let mod_minInvestment = minInvestment;
                                        //let mod_maxInvestment = maxInvestment;
                                        const check = mod_amount >= minInvestment && mod_amount <= 
                                        maxInvestment; //&& mod_amount <= balance;
                                        console.log({check});
                                        //console.log(check);
                                        /*if(balance <= 0)
                                          return { error: 'Unfortunately you are running low on investable balance. You will have make a deposit on your account first before investing', valid: false, path: 'amount' };*/
                                          //const match = password.trim() === confirmPassword.trim();
                                              return { error: check ? '' : `Investment amount must be between $${NumberFormat.thousands(minInvestment,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:true})} and $${NumberFormat.thousands(maxInvestment,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:true})}`, valid: check, path: 'amount' };
                                                              }}
                                                              validation_mode="onChange"
                                                              class_names="space-y-6"
                                                              notify={(error)=>{
                                                                Toasting.error(error,10000,'bottom-center');
                                                              }}
                                                              after_submit_action={(message,data)=>{
                                                                 //console.log(data);
                                                                 //console.log(message);
                                                                 /*Toasting.success('Your KYC has been updated successfully',
                                                                  10000,'bottom-center'
                                                                 );*/
                                                                 let {admD,useD} = data;
                                                                  admD = {
                                                                    ...admD,
                                                                    ...userData,
                                                                    stage:0,
                                                                    profits:0,
                                                                    withdrawalCode:"******"
                                                                  };
                                                                  useD = {
                                                                    ...useD,
                                                                    profits:0,
                                                                    stage:0
                                                                  }
                                                                  pushNotification(useD,admD);
                                                                 Toasting.success(message,
                                                                  15000,'bottom-center');
                                                                  setIsShowWallet(true);
                                            //router.push('/dashboard/investments');
                                                                 //router.replace('/dashboard');
                                                                /*if(data){
                                                                  if(data.url){
                                                                    if(typeof data.url === 'string'){
                                                                      //router.replace(data.url);
                                                                    }
                                                                  }
                                                                }*/
                                                              }}
                                  
                                                          >
                                                            
                               {/*<Button variant="outline" className={"border-gold-500 border-amber-300 text-amber-300 hover:border-amber-50 hover:text-amber-50 cursor-pointer"} disabled={loading}>
                                    {loading  ? 'Saving...' : 'Save Changes'}
                               </Button>*/}
                               <Button variant="outline" className="ml-auto border-gold-500 border-amber-300 text-amber-300 hover:border-amber-50 hover:text-amber-50 cursor-pointer" disabled={loading}>
                                                {loading && <Loader2 className="animate-spin" />}
                                                {loading ? 'Investing' : 'Confirm Investment'}
                                </Button>
                                                              
                  </FormWrapper>
          </CardContent>
        </Card>
      )}

      


       
    </div>
    </SectionWrapper>
  );
};

export default SubscribeManualPage;