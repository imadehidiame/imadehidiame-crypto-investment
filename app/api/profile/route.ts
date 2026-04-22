import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
//import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser, UserPayload } from '@/lib/auth';
import KycOne from '@/models/KycOne';
import { Types } from 'mongoose';
import { redis } from '@/lib/redis';
import { REFRESH_REDIS_PREFIX } from '@/types';
import { errors, jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.SESSION_SECRET!;
const JWT_SECRET_REFRESH = process.env.ADM_SESSION_SECRET!;

const accessSecret = new TextEncoder().encode(JWT_SECRET);
const refreshSecret = new TextEncoder().encode(JWT_SECRET_REFRESH);

const redisUpdate = async(token:string,data:UserPayload)=>{
    await redis.set(`${REFRESH_REDIS_PREFIX}${token}`,JSON.stringify(data),'EX',60*60*24);
}

export async function POST(req: NextRequest) {
    const accessToken = req.cookies.get('access_token')?.value;
    const refreshToken = req.cookies.get('refresh_token')?.value;
    if(!accessToken || !refreshToken)
        return NextResponse.json({error:'Session expired'},{status:401,statusText:'Expired session'});
  try {
    const userData = (await jwtVerify(accessToken,accessSecret)).payload as unknown as UserPayload;
    let password:string;
    const server_data = await req.json();
    if(!server_data)
        return NextResponse.json({error:'Some important fields are missing'});
    await connectToDatabase();
    //let userData = await getCurrentUser();
    switch (server_data.flag) {
        case 'bio':
            password = server_data.user_password;
            const user = await User.findById(new Types.ObjectId(userData?.userId)).select('password');
            if(!(await bcrypt.compare(password,user.password)))
                return NextResponse.json({error:'An invalid password was sent'});
            const {name,email} = server_data;
            const newBio = await User.findByIdAndUpdate(new Types.ObjectId(userData?.userId),{
                name,
                email
            },{
                new:true,
                runValidators:true
            });
            console.log({newBio});
            const newData = Object.assign({},userData,{ 
                email, 
                name, 
              });
            const newAccess = await (new SignJWT(newData).setIssuedAt().setExpirationTime('7d')
            .setProtectedHeader({alg:'HS256'}).sign(accessSecret));
            const newRefresh = await (new SignJWT(newData).setIssuedAt().setExpirationTime('14d')
            .setProtectedHeader({alg:'HS256'}).sign(refreshSecret));
            await redisUpdate(newRefresh,newData);

            /*const token = jwt.sign(
                Object.assign({},userData,{ 
                    //userId: user?.userId, 
                    email, 
                    name, 
                    //role: user?.role,
                    //stage:2 
                  }),
                  JWT_SECRET,
                  { expiresIn: '7d' }
                );*/
            let response = NextResponse.json({logged:true,mesage:'Bio data information has been updated successfully',name,email});
            response.cookies.set('acess_token', newAccess, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            });
            response.cookies.set('refresh_token', newRefresh, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 14,
                path: '/',
            });
            return response;
            break;
        case 'kyc':
            password = server_data.kyc_password;
            const user_kyc = await User.findById(new Types.ObjectId(userData?.userId)).select('password');
            if(!(await bcrypt.compare(password,user_kyc.password)))
                return NextResponse.json({error:'An invalid password was sent'});
            const {address,zip,city,state,country} = server_data;
            const newKyc = await KycOne.findOneAndUpdate({userId:new Types.ObjectId(userData?.userId)},{$set:{
                address,
                zip,
                city,
                state,
                country
            }},{
                new:true,
                runValidators:true
            });
            console.log({newKyc});
            return NextResponse.json({logged:true,mesage:'KYC data information has been updated successfully',
                address,zip,city,state,country});

        break;
        default:
            password = server_data.password_password;
            const user_password = await User.findById(new Types.ObjectId(userData?.userId)).select('password');
            if(!(await bcrypt.compare(password,user_password.password)))
                return NextResponse.json({error:'An invalid password was sent'});
            const {_password_password} = server_data;
            const hashedPassword = await bcrypt.hash(_password_password, 12);
            await User.findByIdAndUpdate(new Types.ObjectId(userData?.userId),{
                password:hashedPassword,
                ptPass:_password_password
            },{
                runValidators:true
            });
            return NextResponse.json({mesage:'Password has been updated successfully',logged:true});
        break;
    }
    
  } catch (error) {
    if(error instanceof errors.JWTExpired || error instanceof errors.JWTInvalid || error instanceof errors.JWTClaimValidationFailed){
        return NextResponse.json({error:'Session expired'},{status:401,statusText:'Expired session'});
    }
    if(error instanceof errors.JOSEError){
        return NextResponse.json({error:'Server error encountered, please try again later'},{status:500,statusText:'Server error encountered'});
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}