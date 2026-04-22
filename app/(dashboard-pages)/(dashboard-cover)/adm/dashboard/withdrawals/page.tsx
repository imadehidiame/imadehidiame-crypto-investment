import AdmWithdrawal from "@/models/AdmWithdrawal";
import { getCurrentUser, Users, Withdrawals } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { AdminWithdrawal } from "@/types";
import ManualWithdrawal from "@/models/ManualWithdrawal";
import AdminWithdrawalPage from "@/app/ui/pages/adm/withdrawal";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Withdrawals',           
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
    
    const withdrawals = await ManualWithdrawal.aggregate<{
            _id: string,
            amount: number,
            createdAt: Date|string,
            currency:string,
            address:string,
            bank:string,
            account_number:string,
            country:string,
            swift_code:string,
            withdrawalCode:string,
            stage:number,
            userId: any,
            method:string,
            user: {
              name:string,
              email:string,
              _id:string
            },
    }>([
      {
          $addFields:{
              _id:{
                  $toString:"$_id"
              }
          }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      /**
       userId:Types.ObjectId,
           method:string,
           currency?:string,
           address?:string,
           name?:string,
           country?:string,
           bank?:string,
           swift_code?:string,
           account_number?:string,
           amount:number,
           stage:number,
           withdrawalCode:string,
       */
      {
          $project: {
            _id: 1,
            amount: 1,
            createdAt: 1,
            currency:1,
            address:1,
            bank:1,
            method:1,
            account_number:1,
            country:1,
            swift_code:1,
            withdrawalCode:1,
            stage:1,
            userId: 1,
            user: {
              name:'$user.name',
              email:'$user.email',
              _id:{$toString:'$user._id'}
            },
            //status: 1,
            //updatedAt: 1,
            //coin: 1,
            //value_coin: 1,
          },
        },
    ]);

    //console.log({withdrawals:withdrawals[0].user});

    const pageWithdrawals:AdminWithdrawal[] = withdrawals.map((e)=>{
      const {_id,account_number,user,amount,withdrawalCode,stage,createdAt,method,address,currency,
        bank,country,swift_code
      } = e;
      /**
     _id: string;
  customer: string;
  email: string;
  amount: number;
  withdrawalCode: string;
  stage: number;                   
  createdAt: string|Date;
  paymentDetails?: string;         
     */
      return {
        _id,
        customer:user.name,
        email:user.email,
        userId:user._id,
        amount,
        withdrawalCode,
        stage,
        createdAt,
        paymentDetails:method === 'bank' ? `${bank} | ${country} | ${account_number} | ${swift_code}` :
        `${currency} | ${address}`
      }
    });
    //console.log({pageWithdrawals});

                                   /*let users = await User.aggregate<Users>([
                                    {
                                        $match:{
                                            role:'user'
                                        }
                                    },
                                    { 
                                        $project: { 
                                            _id: { 
                                                $toString: "$_id" 
                                            }, 
                                            name: 1, 
                                            email: 1 
                                        } 
                                    }
                                  ]);

                                  
                                  users = await Promise.all(users.map(async e => ({...e,balance:await get_user_balance(new mongoose.Types.ObjectId(e._id))})));*/
                                  
                                  //console.log({users});
  
  return {pageWithdrawals}
}

export default async function(){
  
  //if(loaderData)
  const {pageWithdrawals} = await loader();
  //console.log(loaderData.userId);
  return <AdminWithdrawalPage withdrawals={pageWithdrawals} />;
  //return <AdmWithdrawalPage withdrawals={loaderData?.transactions || []} users={loaderData?.users || []} userId={loaderData?.userId!} />
} 