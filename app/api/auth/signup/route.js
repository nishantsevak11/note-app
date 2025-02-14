import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/user';
import { signJWT, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password, name } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
    });

    // Generate JWT
    const token = signJWT({
      userId: user._id,
      email: user.email,
      name: user.name,
    });

    // Set auth cookie
    setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
