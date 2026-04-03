import AdmDeposit from "@/app/ui/pages/adm/adm-deposit";
import { Deposit, getCurrentUser, Users } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import User from "@/models/User";

export const dynamic = 'force-dynamic';


const loader = async () =>{
    await connectToDatabase();
    const user = await getCurrentUser();
    //let transactions  = await Activity.find({userId:user?.user?._id});
    /**
    _id: string;
  deposit: number;
  createdAt: Date;
  status: number;
  updatedAt: Date;
  coin:string;
  userId:{
    name:string;
    _id:string;
  }
  value_coin:number;
     */
    let transactions = await Payment.aggregate<Deposit>([
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
        {
            $project: {
              _id: 1,
              deposit: 1,
              createdAt: 1,
              userId: 1,
              user: {
                name:'$user.name',
                _id:{$toString:'$user._id'}
              },
              status: 1,
              updatedAt: 1,
              coin: 1,
              value_coin: 1,
            },
          },
      ]);

      //log(transactions,'Transation ARRay');

    let transactionss = await Payment.find()
                                   .select('_id deposit createdAt status updatedAt coin value_coin')
                                   .populate('userId','name _id')
                                   //.sort({ timestamp: -1 })
                                   .lean() as unknown as Deposit[];
                                   let users = await User.aggregate<Users>([
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
                                  
                                  
  
  return {transactions,userId:user?.userId,users}
}

export default async function(){
  const loaderData = await loader();
  //if(loaderData)
  return <AdmDeposit deposits={loaderData?.transactions || []} users={loaderData?.users || []} userId={loaderData?.userId!} />
} 