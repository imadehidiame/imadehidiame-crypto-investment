import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = 'user' } = await req.json();
    //console.log({name,email,password,role});
    //name ='';
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' });
    }
    //return NextResponse.json({ error: 'Missing required fields edit' });
    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user'   // Only allow 'admin' if explicitly passed
    });

    return NextResponse.json({ 
      logged:true,
      message: 'User created successfully',
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    }, /*{ status: 201 }*/);
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}