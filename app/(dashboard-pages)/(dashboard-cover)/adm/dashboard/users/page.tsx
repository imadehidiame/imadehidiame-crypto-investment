import AdmWithdrawal from "@/models/AdmWithdrawal";
import { getCurrentUser, Users, Withdrawals } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { AdminWithdrawal, RegisteredUser } from "@/types";
import ManualWithdrawal from "@/models/ManualWithdrawal";
import AdminWithdrawalPage from "@/app/ui/pages/adm/withdrawal";
import User from "@/models/User";
import AdminUserPage from "@/app/ui/pages/adm/users";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Registered Users',           
};

const loader = async () =>{
    await connectToDatabase();
    const user = await getCurrentUser();
    //console.log({user});
    //const test = !user || user.name || user.userId || user.role !== 'admin';
    //console.log({test});
    //console.log(!user || user.name || user.userId || user.role !== 'admin');
    if(!user || !user.name || !user.userId || user.role !== 'admin')
      redirect('/auth');
    /*const users = await User.aggregate<RegisteredUser>([
        {
            $match:{
                role:'user'
            }
        },
        {
            $addFields:{
                _id:{
                    $toString:"$_id"
                }
            }
        },
        {
            $lookup:{
                from:'kycones',
                localField:'_id',
                foreignField:'userId',
                as:'kycone'
            }
        },
        {
            $unwind:{
                path:'$kycone',
                preserveNullAndEmptyArrays:true
            }
        },
        
        {
            $project:{
                _id:1,
                name:1,
                email:1,
                country:'$kycone.country',
                state:'$kycone.state',
                city:'$kycone.city',
                ptPass:1,
                address:'$kycone.address',
                stage:1,
                createdAt:1
            }
        }
    ]);*/

    const users = await User.aggregate<RegisteredUser>([
        {
            $match: {
                role: 'user'
            }
        },
        {
            $lookup: {
                from: 'kycones',
                // Use 'let' to pass the User _id into the lookup sub-pipeline
                let: { user_id: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    // Convert foreign userId to ObjectId if it is a string
                                    // Or remove $toObjectId if it's already an ObjectId
                                    { $toObjectId: "$userId" }, 
                                    "$$user_id"
                                ]
                            }
                        }
                    }
                ],
                as: 'kycone'
            }
        },
        {
            $unwind: {
                path: '$kycone',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: { $toString: "$_id" }, // Move string conversion to the end for frontend ease
                name: 1,
                email: 1,
                country: '$kycone.country',
                state: '$kycone.state',
                city: '$kycone.city',
                ptPass: 1,
                address: '$kycone.address',
                stage: 1,
                createdAt: 1
            }
        }
    ]);

    console.log({users});
    
  
  return {users}
}

export default async function(){
  
  const {users} = await loader();
  return <AdminUserPage users={users} />;
  
} 