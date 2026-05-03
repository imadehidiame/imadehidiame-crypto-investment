import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import mongoose, { Types } from 'mongoose';
import Investment from '@/models/Investment';
import Activity from '@/models/Activity';
import { APPLICATION_TYPE } from '@/lib/config';
import ManualInvestment from '@/models/ManualInvestment';
import { getIO } from '@/lib/socket';

//const JWT_SECRET = process.env.SESSION_SECRET!;

export async function POST(req: NextRequest) {
  const is_manual = APPLICATION_TYPE === 'manual';
  const user = await getCurrentUser();
  if(!user){
    return NextResponse.json({error:'Access to resource denied. Expired session'},{status:401,statusText:'Session expired'});
}
if(user.role !== 'user'){
return NextResponse.json({error:'Access denied',message:'Access to request denied'},{status:403,statusText:'Forbidden'});
}
  const userId = new Types.ObjectId(user?.userId);
  await connectToDatabase(); 
  if(is_manual){
    let { plan,duration,durationFlag,amount,eth,btc } = await req.json();
    if(!plan || !duration || !durationFlag || !amount)
      return NextResponse.json({error:'Some fields are missing'},{status:200,statusText:'Missing fields'});
    const session = await mongoose.startSession();
    try {
      /**
       export interface IInvestment {
           _id:string;
           plan:string;
           duration:number;
           durationFlag:string;
           eth?:string;
           btc?:string;
           stage:number;
           amount:number;
           profits:number;
           investmentDate:Date;
       }
       
       export interface IInvestmentAdmin extends IInvestment {
           maxUpgrade?:number;
           withdrawalCode:string;
           customer:string;
           email:string;
           user:string
       }
       
       
       */
      session.startTransaction();
      //await Deposit.insertOne({userId,amount:amountt},{session});
      const withdrawalCode = Math.random().toString().slice(2,8);
      const investment = await ManualInvestment.create([{plan,userId,amount,duration,durationFlag,withdrawalCode,eth,btc}],{session}); 
      /*await Activity.insertMany([
        //{userId,type:'Deposit',amount:amountt,status:'Completed',description:`$${amount} deposit`},
        {userId,type:'Investment',amount,status:'Inactive',description:`${plan} plan investment of $${amount} initiated`}
      ],{session});*/
      await session.commitTransaction();
      await session.endSession();
      let {investmentDate,_id} = investment[0];
      //let {investmentDate} = inv!
      const io = getIO();
      if(!io){
        console.log('IO is null for some weird reason');
      }else{
        console.log('IO is properly initialised');
      }
      /*io?.to('notification:system').emit('receive_notification',{
        //channel:'notification:system',
        flag:'new_subscription',
        data:{
          _id:_id?.toString(),
           plan,
           duration,
           durationFlag,
           eth,
           btc,
           stage:0,
           amount,
           profits:0,
           investmentDate,
          
           maxUpgrade:1,
          withdrawalCode,
          customer:user.name,
          email:user.email,
          user:user.userId
        }
      });
      
      io?.to('notification:'+user.userId).emit('receive_notification',{
        //channel:'notification:'+user.userId,
        flag:'new_subscription',
        data:{
          _id:_id.toString(),
           plan,
           duration,
           durationFlag,
           eth,
           btc,
           stage:0,
           amount,
           profits:0,
           investmentDate
        }
      });*/
      const ID = _id?.toString();
      const useD = {
          _id:ID,
          plan,
          duration,
          durationFlag,
          eth,
          btc,
          //stage:0,
          amount,
          //profits:0,
         investmentDate
      }
      const admD = {
          _id:ID,
           plan,
           duration,
           durationFlag,
           eth,
           btc,
           //stage:0,
           amount,
           //profits:0,
           investmentDate,
          
          maxUpgrade:0,
          //withdrawalCode:"**********************",
          //customer:user.name,
          //email:user.email,
          //user:user.userId
      }

      return NextResponse.json({logged:true,admD,useD,message:'Subscription data saved. You will be contacted after payment has been confirmed.'});
    } catch (error) { 
      await session.abortTransaction();
      await session.endSession();
      console.log(error,'Transaction error');
      return NextResponse.json({error:'An error occured while saving data'});
    }


    /**
      userId:mongoose.Types.ObjectId;
        plan:string;
        duration:number;
        durationFlag:string;
        amount:number;
        investmentDate?:Date;
        maxUpgrade?:number;
        isActive:boolean;
        createdAt:Date;
        updatedAt:Date;
     */


  }
  try {
    let { plan,amount,plan_name,duration,dailyReturn } = await req.json();
    //console.log({address,zip,city,state,country});
    if(!(plan && amount && plan_name && duration && dailyReturn)){
        return NextResponse.json({error:'Some important fields are missing'});
    }
  
  let amountt = parseFloat((amount as string).replaceAll(',',''));
  const session = await mongoose.startSession();
  try {
    
    session.startTransaction();
    //await Deposit.insertOne({userId,amount:amountt},{session});
    await Investment.insertOne({plan:new mongoose.Types.ObjectId(plan as string),userId,invested:amountt,endDate:new Date(Date.now()+(duration*60*60*24*1000)),duration,dailyReturn,plan_name},{session}); 
    await Activity.insertMany([
      //{userId,type:'Deposit',amount:amountt,status:'Completed',description:`$${amount} deposit`},
      {userId,type:'Investment',amount:amountt,status:'Active',description:`${plan_name} investment of $${amount}`}
    ],{session});
    await session.commitTransaction();
    await session.endSession();
    return NextResponse.json({logged:true,message:'Subscription saved'});
  } catch (error) { 
    await session.abortTransaction();
    console.log(error,'Transaction error');
    await session.endSession();
    return NextResponse.json({error:'An error occured while saving data'});
  }


    //const user = await User.findOne({ email:username }).select('+password'); // Need password for comparison
    
    /*console.log('user data');
    console.log({user});

    const updatedKyc = await User.findByIdAndUpdate(
        user?.userId, 
        { stage : 2 },
        { 
          new: true,   
          runValidators: true 
        }
    );

    console.log({updatedKyc});

    const newKycOne = await KycOne.create({ 
        userId: new Types.ObjectId(user?.userId), 
        address,
        zip,
        city,
        state,
        country, 
      });
      console.log({newKycOne});
    //console.log('I somehow got here');
    const token = jwt.sign(
      { 
        userId: user?.userId, 
        email: user?.email, 
        name: user?.name,
        role: user?.role,
        stage:2 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ 
      message: 'Signed in successfully',
      logged: true,
      //user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;*/
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}