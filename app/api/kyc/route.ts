import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser, UserPayload } from '@/lib/auth';
import KycOne from '@/models/KycOne';
import { Types } from 'mongoose';
import { SignJWT } from 'jose';
import { REFRESH_REDIS_PREFIX } from '@/types';
import { redis } from '@/lib/redis';

const JWT_SECRET = process.env.SESSION_SECRET!;
const SECRET_ENC = new TextEncoder().encode(JWT_SECRET);
const JWT_SECRET_REFRESH = process.env.ADM_SESSION_SECRET!;
const REFRESH_SECRET_ENC = new TextEncoder().encode(JWT_SECRET_REFRESH);

const redisUpdate = async(token:string,data:UserPayload)=>{
    await redis.set(`${REFRESH_REDIS_PREFIX}${token}`,JSON.stringify(data),'EX',60*60*24);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if(!user){
        return NextResponse.json({error:'User session expired'},{status:401,statusText:'Access to resource denied. Session expired'});
    }
    if(user.role !== 'user'){
      return NextResponse.json({error:'Access denied'},{status:403,statusText:'Access to resource denied'});
    }
    const { address, zip,city,state,country } = await req.json();
    if(!(address && zip && city && state && country)){
        return NextResponse.json({error:'Some important fields are missing'});
    }
    await connectToDatabase();
    //const user = await User.findOne({ email:username }).select('+password'); // Need password for comparison
    
    const updatedKyc = await User.findByIdAndUpdate(
        user?.userId, 
        { stage : 2 },
        { 
          new: true,   
          runValidators: true 
        }
    );

    

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
    const userUpdate:UserPayload = {...user,stage:2};
    const token = await (new SignJWT(userUpdate)).setIssuedAt().setExpirationTime('7d').setProtectedHeader({alg:'HS256'}).sign(SECRET_ENC);
    
    const refresh = await (new SignJWT(userUpdate)).setIssuedAt().setExpirationTime('14d').setProtectedHeader({alg:'HS256'}).sign(REFRESH_SECRET_ENC);
    
    /*jwt.sign(
      { 
        userId: user?.userId, 
        email: user?.email, 
        name: user?.name,
        role: user?.role,
        stage:2 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );*/

    const response = NextResponse.json({ 
      message: 'Signed in successfully',
      logged: true,
      //user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    });

    await redisUpdate(refresh,userUpdate);

    response.cookies.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('refresh_token', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 14,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}