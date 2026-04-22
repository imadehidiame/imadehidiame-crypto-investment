// lib/auth.ts
import 'server-only';                    // Important: Prevents this from running on client
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import KycOne from '@/models/KycOne';
import { Types } from 'mongoose';
import { connectToDatabase } from './mongodb';
import { redirect } from 'next/navigation';

const JWT_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);

export interface Deposit {
  _id: string;
  deposit: number;
  createdAt: Date;
  status: number;
  updatedAt: Date;
  coin:string;
  user:{
    name:string;
    _id:string;
  }
  value_coin:number;
}

export interface Users {
    name:string;
    _id:string;
}

export interface CryptoData {
  coin: string;
  fee_percent: string;
  logo: string;
  minimum_fee: number;
  minimum_fee_coin: string;
  minimum_transaction: number;
  minimum_transaction_coin: string;
  network_fee_estimation: string;
  prices: {
    [currency: string]: string;
  };
  prices_updated: string;
  ticker: string;
}

export interface Deposit {
  _id: string;
  deposit: number;
  createdAt: Date;
  status: number;
  updatedAt: Date;
  coin:string;
  value_coin:number;
}


export interface Subscription {
        id: string;
        name: string;
        minInvestment: number|string;
        maxInvestment: number|string;
        duration: number;
        dailyReturn: number;
}
interface PageProps {
    plans:SubscriptionData;
    initialSelectedPlan: Subscription|null;
    balance: number;
    account_info:{
      earnings:number,
      investments:number
    }
}

export interface WalletAddress {
  _id: string; 
  address: string;
  currency: string;
  label: string;
  createdAt: string; 
}

export interface Withdrawals {
  _id: string;
  amount: number;
  createdAt: Date;
  //updatedAt: Date;
  user:{
    name:string;
    _id:string;
  }
}

export interface Users {
    name:string;
    _id:string;
    balance:number;
}

export interface Withdrawal {
  _id: string;
  plan: string;
  userId: string;
  invested: number;
  startDate: Date;
  isWithdrawal: boolean;
  withdrawal: number; 
  endDate: Date;
  residual_after_withdrawal: number;
 duration: number;
 earnings: number; 
 total: number; 
 dailyReturn:number
 is_active: boolean; 
 remaining_days: number;
status:number
}

export interface SettingsData {
    notifications: {
        emailNotifications: boolean;
        smsNotifications: boolean;
        notifyOnLogin?: boolean;
        twofa_auth?: boolean;
    };
    general: {
        language: string;
    };
    wallets: WalletAddress[]; 
    currencies?: { name: string, value: string }[]
}

export type SubscriptionData = Subscription[];

export type UserPayload = {
  userId: string;
  email: string;
  name: string;
  stage: number;
  role: 'user' | 'admin';
};

export type KycPayload = {
  country: string;
  state: string;
  city: string;
  zip: string;
  address: string;
}

export const is_binary_file = (response:Response)=>{
    //console.log('Response type\n',response.headers.get('Content-Type'));
    const headers = ['image/','application/','text/','audio/','video/','application/vnd','application/octet-stream'];
    return headers.some(e=>response.headers.get('Content-Type')?.startsWith(e) && response.headers.get('Content-Type') !== 'application/json');
  }

  export const evaluate_file_extension = (response:Response) =>{
    const content_type = response.headers.get('Content-Type');
    if(!content_type)
      return '';
    if(content_type === 'image/svg+xml'){
      return 'svg';
    }
    else{
      const exts = content_type.split('/');
      return exts[exts.length - 1];
    }
  }

export const fetch_request_mod = async <T>(method:'POST'|'GET'|'PATCH'|'DELETE',action:string,body?:string|FormData|any|null,is_json?:boolean,binary?:{
    display:'text'|'object_url'|'body'|'download',
    extension?:string;
  }): Promise<{
    data?:any,
    served?:T,
    is_error?:boolean,
    status?:number
  }> => {
    //console.log({body,is_json,method});
    try {
        if(method === 'POST' || method === 'PATCH'){
                body = body instanceof FormData || typeof body == 'string' || body instanceof URLSearchParams ? body :  JSON.stringify(body);
        }
        const response = is_json ? await fetch(action,{method,body,headers:{'Content-Type':'application/json'}}) : method === 'GET' || method === 'DELETE' ? await fetch(action,{method}) : await fetch(action,{method,body});
        const {status,statusText,ok} = response.clone(); 
        //console.log({status,statusText,ok});
        if(!ok || status !== 200){
            //console.log(await response.text()); 
            if(statusText)
            return { is_error:true,data:statusText,status };  
            return {is_error:true,status,data:'Unspecified error'}; 
        }
        if(is_binary_file(response.clone())){
          if(binary?.display === 'body'){
            return {data:response.body,status};
          }else {

          let chunks = [];
          let total_length = 0;
          const reader = response.body?.getReader();
          while(true){
            const {value,done} = (await reader?.read())!;
            if(done){
              break;
            }
            chunks.push(value);
            total_length+=value.length;
          }
          
          if(binary?.display === 'text'){
            let uint8array = new Uint8Array(total_length);
            let offset = 0;
            for (const chunk of chunks) {
              uint8array.set(chunk,offset);
              offset += chunk.length;
            }
            const text_decoder = new TextDecoder('utf-8');
            return {data:text_decoder.decode(uint8array),is_error:false};
          }
          const blob = new Blob(chunks,{type:response.headers.get('Content-Type') as string});
          //console.log('Blob data \n',blob);
          const url = URL.createObjectURL(blob);
          if(binary?.display === 'download'){
            const a = document.createElement('a');
            a.href = url;
            if(binary.extension)
            a.download = `download_file.${binary.extension}`;
            else
            a.download = `download_file.${evaluate_file_extension(response)}`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return {data:null,status,is_error:false};
          }
          return {data:url,status,is_error:false};
          }
          
        }else{

          const contentType = response.headers.get("Content-Type");
          if (!contentType?.includes("application/json")) {
            return {served:await response.text() as T,status,is_error:false};
          }
            return {served:await response.json(),status,is_error:false};
        }
        
    } catch (error) {
      console.log('Error during fetch\n',error);
        return {is_error:true,data:null}
    }
}

export async function redirect_no_auth(){
  const session = await getCurrentUser();
  if(!session)
    redirect('/auth');
  return session;
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      stage: payload.stage as number,
      role: (payload.role as 'user' | 'admin') || 'user',
    };
  } catch (error) {
    // Token invalid, expired, or tampered
    return null;
  }
}

export async function getUserKyc(userId?:string):Promise<KycPayload|null> {
  try {
    //const user = await getCurrentUser();
    await connectToDatabase();
    const kyc = await KycOne.findOne({ userId: userId ? new Types.ObjectId(userId) : new Types.ObjectId((await getCurrentUser())?.userId) });
    
    if(kyc){
      return {
        address:kyc.address,
        city:kyc.city,
        country:kyc.country,
        state:kyc.state,
        zip:kyc.zip
      }
    }
    return null;
  } catch (error) {
    return null;
  }
  
}

// Optional: Get only the role (useful for quick checks)
export async function getUserRole(): Promise<'user' | 'admin' | null> {
  const user = await getCurrentUser();
  return user?.role || null;
}

export async function getUserStage(): Promise<number | 0> {
    const user = await getCurrentUser();
    return user?.stage || 0;
  }