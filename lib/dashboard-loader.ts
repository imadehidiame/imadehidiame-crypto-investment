import 'server-only';
import { getCurrentUser } from './auth';
import Investment from '@/models/Investment';
import { Types } from 'mongoose';
import Deposit from '@/models/Deposit';
import AdmWithdrawal from '@/models/AdmWithdrawal';
import Activity from '@/models/Activity';
//import { NumberFormat } from '@imadehidiame/react-form-validation';
import { get_earnings, investment_pie_chart, is_transaction_active, NumberFormat } from './utils';
import { connectToDatabase } from './mongodb';




export async function account_info(id:string|any){
  //const Deposit = (await import('@/models/Deposit')).default
  //const Investment = (await import('@/models/Investment')).default    
  try {
  //log(id,'ID VALUE')
    const userId = new Types.ObjectId(id);
      let residuals = (await Investment.find({userId}).populate('plan','name duration dailyReturn')).reduce((acc,{startDate,endDate,invested,dailyReturn,plan_name,withdrawal})=>{
          if(!is_transaction_active(endDate as Date)){
            return {...acc,earnings:acc.earnings+=get_earnings(startDate as Date,dailyReturn as number,invested as number,endDate as Date) - withdrawal as number}
          }else{
            return {...acc,investments:acc.investments+=invested}
          }
        },{investments:0,earnings:0} as {investments:number,earnings:number}) as {investments:number,earnings:number};
  
      let deposits  = (await Deposit.find({userId}).sort({date:-1})).reduce((acc,{amount})=>{
          return acc+=amount;
        },0);
      
        residuals = Object.assign({},residuals,{investments:parseFloat((residuals.investments as number).toFixed(2)),earnings: parseFloat((residuals.earnings+=deposits as number).toFixed(2))}) as {earnings:number,investments:number};
        return {...residuals,investable:residuals.earnings-residuals.investments as number};
        //return Object.assign({},residuals,{investable:residuals.earnings-residuals.investments as number});

  } catch (error) {
      console.log(error);
  }
}

export const dashboardLoader = async (/*{context}:Route.LoaderArgs*/) =>{
  //const use_new = await User.create({name:'Admin Man',email:'freetone4life@gmail.com',role:'admin',password:'goodhitage'});
  //log(use_new,'New user data');
  const context_data = await getCurrentUser();
  await connectToDatabase();
  const userId = new Types.ObjectId(context_data?.userId);
  

  const investments:{
  plan:{
    duration:number, 
    dailyReturn:number,
    name:string
  },
  invested:number,
  endDate:Date,
  startDate:Date,
  isWithdrawal:boolean,
  withdrawal:number,
  //balance:0,
  //earnings:0
  //active_investments:0,
  //active_investments_amount:0,
  //deposit:0
  
}[] = (await Investment.find({userId}).populate('plan','duration dailyReturn name')).map(e=>({...e._doc,...{/*earnings:0,balance:0,deposit:0,active_investments:0,active_investments_amount:0*/}}));
//log(investments,'Investments');

let deposits  = (await Deposit.find({userId}).sort({date:-1})).reduce((acc,{amount})=>{
  return acc+=amount;
},0)

type AdmWithdraw = {amount:number};

//log(deposits,'Depositss');
let adm_withdrawals:number = (await AdmWithdrawal.find({userId})).reduce((prev:number,{amount}:AdmWithdraw)=>{
  return prev+=amount
},0)
let recentTransactions  = await Activity.find({userId}).sort({date:-1})
    recentTransactions = recentTransactions.map(({_id,type,amount,status,description,date},i)=>({
        //log(e,'transaction');
        id:_id.toString(),date:date.toLocaleDateString(),datee:date,type,amount:type.includes('Investment') || type.includes('Withdrawal') ? `-$${NumberFormat.thousands(amount,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:false})}`:`$${NumberFormat.thousands(amount,{allow_decimal:true,length_after_decimal:2,add_if_empty:true,allow_zero_start:false})}`,status,plan:description
    }))///.sort((a,b)=>b.datee.getTime()-a.datee.getTime());

    const months = {
      '0':'Jan',
      '1':'Feb',
      '2':'Mar',
      '3':'Apr',
      '4':'May',
      '5':'Jun',
      '6':'Jul',
      '7':'Aug',
      '8':'Sep',
      '9':'Oct',
      '10':'Nov',
      '11':'Dec',
  }
  
  let account_balance = investments.reduce((acc,{invested,startDate,plan,withdrawal,endDate},index,array)=>
    (
      {
        earnings:acc.earnings+get_earnings(startDate,plan.dailyReturn,invested,endDate),
        earning_month:acc.earning_month ? acc.earning_month+='{}'+startDate.getMonth() : startDate.getMonth().toString(),
        //earning_data:{...acc.earning_data,[startDate.getMonth().toString()]:acc.earning_data[startDate.getMonth().toString() as keyof typeof acc.earning_data] ? acc.earning_data[startDate.getMonth().toString() as keyof typeof acc.earning_data]+=','+ get_earnings(startDate,plan.dailyReturn,invested) : (get_earnings(startDate,plan.dailyReturn,invested)).toString()},
        earning_dates:{...acc.earning_dates,[endDate.toLocaleDateString()]: acc.earning_dates[endDate.toLocaleDateString()] ? acc.earning_dates[endDate.toLocaleDateString() as keyof typeof acc.earning_dates].concat([get_earnings(startDate,plan.dailyReturn,invested,endDate)]): [get_earnings(startDate,plan.dailyReturn,invested,endDate)]},
        earning_dataa:{...acc.earning_dataa,[months[startDate.getMonth().toString() as keyof typeof months]]:acc.earning_dataa[months[startDate.getMonth().toString() as keyof typeof months] as keyof typeof acc.earning_dataa].concat([get_earnings(startDate,plan.dailyReturn,invested,endDate)])},
        balance:(get_earnings(startDate,plan.dailyReturn,invested,endDate)/*+invested*/-withdrawal)+acc.balance,
        active_investments:is_transaction_active(endDate) ? acc.active_investments+1 : acc.active_investments+0,
        active_investments_amount: is_transaction_active(endDate) ? acc.active_investments_amount + invested : acc.active_investments_amount + 0,
      //plans: is_transaction_active(endDate) ? acc.plans ? acc.plans+='{}'+plan.name : acc.plans+=plan.name : acc.plans+='',
      //investments:[...[invested]] 
      }
    ),
      {
        balance:0,
        earnings:0,
        active_investments:0,
        active_investments_amount:0,
        earning_month:'',
        earning_dates:{} as {[date:string]:number[]},
        earning_dataa:({
          'Jan':[],
          'Feb':[],
          'Mar':[],
          'Apr':[],
          'May':[],
          'Jun':[],
          'Jul':[],
          'Aug':[],
          'Sep':[],
          'Oct':[],
          'Nov':[],
          'Dec':[],
        } as {[x:string]:number[]} )
        //plans:'',
        //investments:[]
      });
      
      account_balance = Object.assign({},account_balance,{balance:((deposits as number)+account_balance.balance)});
      account_balance = Object.assign({},account_balance,{balance:(account_balance.balance - adm_withdrawals)>=0 ? account_balance.balance - adm_withdrawals : 0 });
      
  //    log(account_balance,'Earning dates');

      let earnings_title = 'Earnings Title';
      let earnings_data_months:string[] = [];
      let earnings_data_values:number[];
      let earnings_mod:{[x:string]:number};
      let earnings_data_valuess  = Object.entries(account_balance.earning_dataa).filter(([months,earnings])=>earnings.length > 0);
      if(earnings_data_valuess.length > 1){
        earnings_mod = earnings_data_valuess.reduce((acc,[month,earnings])=>{
          return {...acc,[month]:earnings.reduce((a,cur)=>a+cur,0)};
        },{} as {[x:string]:number})
      }else{
        earnings_title = earnings_data_valuess.length > 0 ?  'Earnings in '+earnings_data_valuess[0][0] : earnings_title
        earnings_data_valuess = Object.entries(account_balance.earning_dates);
        earnings_mod = earnings_data_valuess.reduce((acc,[month,earnings])=>{
          return {...acc,[month]:earnings.reduce((a,cur)=>a+cur,0)};
        },{} as {[x:string]:number})
      }
      
      /*.reduce((acc,[month,earnings])=>{
        return {...acc,[month]:earnings.reduce((a,cur)=>a+cur,0)};
      },{} as {[x:string]:number})*/

    //  log(earnings_data_valuess,'Earnings data value');

      earnings_data_values = /*Object.values(account_balance.earning_dataa).filter(e=>e.length > 0).map(e=>{
        return e.reduce((acc,current)=>current+acc,0);
      })*/ Object.values(earnings_mod);

      earnings_data_months = /*Object.keys(account_balance.earning_dataa).filter(e=>account_balance.earning_dataa[e as keyof typeof account_balance.earning_dataa].length > 0).map(e=>months[e as keyof typeof months]);*/ Object.keys(earnings_mod);

  //log(earnings_data_months,'Account balance')

  //log(transactions,'transactions');

  const active_investments = investments.filter(e=>is_transaction_active(e.endDate)).map(e=>({invested:e.invested,name:e.plan.name}));

  const portfolioChartData = investment_pie_chart(account_balance.active_investments_amount,active_investments);
//log(pie_chart,'Pie Chart')

  return {name:context_data?.name,account_balance,recentTransactions,portfolioChartData,earnings_data_months,earnings_data_values,earnings_title};
}