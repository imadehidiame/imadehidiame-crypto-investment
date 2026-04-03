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
    const { address, zip,city,state,country } = await req.json();
    console.log({address,zip,city,state,country});
    if(!(address && zip && city && state && country)){
        return NextResponse.json({error:'Some important fields are missing'});
    }
    await connectToDatabase();
    //const user = await User.findOne({ email:username }).select('+password'); // Need password for comparison
    const user = await getCurrentUser();
    console.log('user data');
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

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}