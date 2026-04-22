import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
//import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { SignJWT } from 'jose';
import { redis } from '@/lib/redis';

const JWT_SECRET = process.env.SESSION_SECRET!;
const JWT_SECRET_REFRESH = process.env.ADM_SESSION_SECRET!;

const secret = new TextEncoder().encode(JWT_SECRET);
const refreshSecret = new TextEncoder().encode(JWT_SECRET_REFRESH);

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    console.log({username,password});
    await connectToDatabase();
    const user = await User.findOne({ email:username }).select('+password'); // Need password for comparison

    //console.log(user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid credentials submitted' });
    }
    //console.log('I somehow got here');
    /*const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email, 
        name: user.name,
        role: user.role,
        stage:user.stage 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );*/

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      stage: user.stage,
    };
    
    const accessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()                    
      .setExpirationTime('7d')          
      .sign(secret);

    const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({alg:'HS256'})
    .setIssuedAt()
    .setExpirationTime('14d')
    .sign(refreshSecret);

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

    /*response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });*/
    user.refreshToken = refreshToken;
    user.refreshTokenTimestamp = new Date();
    await user.save();
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 14,
      path: '/',
    });

    await redis.set(`refresh:${refreshToken}`,JSON.stringify(payload),'EX',60*60*24);
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}