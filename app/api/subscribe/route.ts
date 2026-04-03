import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import mongoose, { Types } from 'mongoose';
import Investment from '@/models/Investment';
import Activity from '@/models/Activity';

//const JWT_SECRET = process.env.SESSION_SECRET!;

export async function POST(req: NextRequest) {
  try {
    let { plan,amount,plan_name,duration,dailyReturn } = await req.json();
    //console.log({address,zip,city,state,country});
    if(!(plan && amount && plan_name && duration && dailyReturn)){
        return NextResponse.json({error:'Some important fields are missing'});
    }
    await connectToDatabase();
    
    const user = await getCurrentUser();
  
  const userId = new Types.ObjectId(user?.userId);
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

    return NextResponse.json({logged:true,message:'Subscription saved'});
  } catch (error) { 
    await session.abortTransaction();
    console.log(error,'Transaction error');
    return NextResponse.json({error:'An error occured while saving data'});
  }finally {
    await session.endSession();
    //return {data:{logged:false,error:'An error occured on the server. Please try again later'}};
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