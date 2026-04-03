import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import KycOne from '@/models/KycOne';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.SESSION_SECRET!;

export async function POST(req: NextRequest) {
  try {
    let password:string;
    const server_data = await req.json();
    if(!server_data)
        return NextResponse.json({error:'Some important fields are missing'});
    await connectToDatabase();
    let userData = await getCurrentUser();
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
            const token = jwt.sign(
                Object.assign({},userData,{ 
                    //userId: user?.userId, 
                    email, 
                    name,
                    //role: user?.role,
                    //stage:2 
                  }),
                  JWT_SECRET,
                  { expiresIn: '7d' }
                );
            let response = NextResponse.json({logged:true,mesage:'Bio data information has been updated successfully',name,email});
            response.cookies.set('auth-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7,
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
                password:hashedPassword
            },{
                runValidators:true
            });
            return NextResponse.json({mesage:'Password has been updated successfully',logged:true});
        break;
    }
    
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}