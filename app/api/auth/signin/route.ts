import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.SESSION_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    console.log({username,password});
    await connectToDatabase();
    const user = await User.findOne({ email:username }).select('+password'); // Need password for comparison

    console.log(user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid credentials submitted' });
    }
    //console.log('I somehow got here');
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email, 
        name: user.name,
        role: user.role,
        stage:user.stage 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    let url:string='';
    if(user.role === 'admin')
      url = '/adm/dashboard';
    else{
      if(user.stage === 1){
        url = '/kyc';
      }else{
        url = '/dashboard'
      }
    }

    const response = NextResponse.json({ 
      message: 'Signed in successfully',
      url,
      logged:true
      //user: { role: user.role === 'admin' ? 'adm' : "use", url  }
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