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
//import type { Route } from "./+types/dashboard-messaging-adm";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import AdmMessaging from "@/app/ui/pages/adm/adm-messaging";
import { connectToDatabase } from "@/lib/mongodb";
//import MessagingPageAdm from "@/components/dashboard-views/adm/message";

interface Message {
  id: number | string;
  sender: string | 'self';
  content: string;
  timestamp: string | Date;
}

interface MessageThread {
  id: number | string;
  subject: string;
  is_new?:boolean;
  user?:{
    id:string,
    name:string,
  },
  timestamp: Date;
  read?: boolean;
  admin_read?: boolean;
  updatedAt: Date;
  messages: Message[];
  isDraft?: boolean;
  draft?: string;
}

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
  const {userId} = context_data!;
  await connectToDatabase();

  const users_data = (await User.find({role:'user'},{_id:1,name:1})).map(({_id,name})=>({id:_id.toString(),name}));
  
  
  return {userId,users_data}
}

export default async function(){
  
  const {users_data,userId} = await loader();
  {/*return <MessagingPage user={loaderData?.user as unknown as UserData} messageThreads={loaderData?.messages!} />*/}
  return <AdmMessaging users_data={users_data} userId={userId} />
} 