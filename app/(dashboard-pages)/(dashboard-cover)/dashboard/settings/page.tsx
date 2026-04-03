//import { getSess } from "@/layouts/app-layout";
//import type { Route } from "./+types/dashboard-settings";
//import SettingsPage, {type SettingsData}  from "@/components/dashboard-views/user/settingsg";
import User from "@/models/User";
import { Types } from "mongoose";
import  Setting  from "@/models/Setting";
import { getCurrentUser, SettingsData } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import SettingsPage from "@/app/ui/pages/settings";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Settings',           
};

const loader = async () =>{
    await connectToDatabase();
    const context_data = await getCurrentUser();
    if(!context_data)
        redirect('/auth');
    const userId = new Types.ObjectId(context_data?.userId);
    //const session = await get_flash_session(request);
    //log(session,'Session Data');
    

    let user_settings = await User.aggregate([
        {
            $match:{
                _id: userId
            },    
        },
        {
            $lookup:{
                from:'settings',
                localField:'_id',
                foreignField:'userId',
                as:'notifications'
            }
        },
        {
            $unwind:{
                path:'$notifications',
                preserveNullAndEmptyArrays:true
            }
        },
        {
            $lookup:{
                from:'wallets',
                as:'wallets',
                localField:'_id',
                foreignField:'userId'
            }
        },
        {
            $project:{
                _id:1,
                wallets:'$wallets',
                notifications:'$notifications'//  {$arrayElemAt:['$userSettings',0]}
            }
        }
    ]
);

/**
 notifications: {
        emailNotifications: boolean;
        smsNotifications: boolean;
        notifyOnLogin?: boolean;
        twofa_auth?: boolean;
    };
    general: {
        language: string; // Use string for language
    };
    wallets: WalletAddress[];
 */

    //log(user_settings[0],'User settings');
    //log(user_settings[0].notifications,'User settings notifications');
//console.log('User notifications');
//console.log(user_settings);

if(!user_settings[0].notifications){
    const setting = await Setting.insertOne({
        userId, // Link to the user
            notifications: {
                emailNotifications: true,
                smsNotifications: false,
                notifyOnLogin: false,
                twofa_auth: false, 
            },
            general: {
                language: 'en', 
            }
    });
    user_settings[0].notifications = {
        _id:setting._id.toString(),
        userId:context_data?.userId, // Link to the user
            notifications: {
                emailNotifications: true,
                smsNotifications: false,
                notifyOnLogin: false,
                twofa_auth: false,
            },
            general: {
                language: 'en', 
            },
            createdAt:new Date(Date.now()),
            updatedAt:new Date(Date.now())
    }
    //log(setting,'Basic Settings');
}else{
    //user_settings[0].notifications = user_settings[0].notifications.notifications;
    //user_settings[0].general = user_settings[0].general;
    //log(user_settings[0],'Final note');
}
//log(Object.assign({},user_settings[0].notifications,{wallets:user_settings[0].wallets.map((e:any)=>({...e,_id:e._id.toString()}))}),'Final take note');
  //console.log(user_settings[0].notifications.notifications);
  //console.log(user_settings[0].notifications.general);
  const ob = {user_settings: Object.assign({},user_settings[0].notifications,{_id:user_settings[0]._id.toString(),userId:userId.toString(),wallets:user_settings[0].wallets.map((e:any)=>({...e,_id:e._id.toString(),userId:e.userId ? e.userId.toString():''}))})};
    //console.log(ob);
    //console.log('Wallet data');
    //console.log(ob.user_settings.wallets);
    //console.log(user_settings[0].wallets);
  return ob;
}

export default async function(){
    const loaderData = await loader();
  return <SettingsPage settings={loaderData?.user_settings as SettingsData} />
  
} 