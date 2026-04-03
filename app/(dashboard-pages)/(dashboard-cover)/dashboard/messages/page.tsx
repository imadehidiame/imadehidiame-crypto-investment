//import { getSess } from "@/layouts/app-layout";
//import type { Route } from "./+types/dashboard-home";
//import DashboardHome, { type RecentTransactionsData } from "@/components/dashboard-views/user/home";
//import type { Route } from "./+types/dashboard-profile";
//import DashboardProfile from "@/components/dashboard-views/user/profile";
//import type { UserData } from "@/lib/config/session";
//import { log } from "@/lib/utils";
//import MessagingPage, { type Message as ChatMessage, type MessageThreadData } from "@/components/dashboard-views/user/messaging";
//import type { Route } from "./+types/dashboard-messaging";
//import Message from "@/models/Message.server";
import MessagingPageUser from "@/app/ui/pages/messaging";

import { getCurrentUser } from "@/lib/auth";


const string_to_date = (date:string|Date)=>{
    return typeof date === 'string' ? (new Date(date)).getTime() : date.getTime();
  }
/**
 * 
  id: number | string;
  subject: string;
  read: boolean;
  updatedAt:Date;
  messages: Message[];
  isDraft?:boolean;
  draft?:string; 

 */

export const loader = async () =>{
  const context_data = await getCurrentUser();
  
  //log(context_data?.user?._id.toString(),'User data');
  const {name,userId:_id} = context_data!;
  //const messages = (await Message.find({userId:context_data?.user?._id},{subject:1,read:1,messages:1,updatedAt:1,_id:1,userId:1})).map(({_id,subject,read,updatedAt,messages})=>({id:_id.toString(),subject,read,updatedAt,messages:messages.map((e:any)=>e._doc),timestamp:updatedAt})) as unknown as MessageThreadData;

  
  return {user_data:{_id:_id.toString(),name}}
}

export default async function(){
  
  const {user_data} = await loader();
  {/*return <MessagingPage user={loaderData?.user as unknown as UserData} messageThreads={loaderData?.messages!} />*/}
  return <MessagingPageUser user_data={user_data} />
  //return <MessagingPage user={loaderData?.user as unknown as UserData} messageThreads={loaderData?.messages!} />
} 