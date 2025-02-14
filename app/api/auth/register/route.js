import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import NoteUser from '@/lib/models/user';

export async function POST(req) {
  try {
    await dbConnect();
    
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await NoteUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password with bcryptjs
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await NoteUser.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Remove password from response
    const userResponse = user.toJSON();

    return NextResponse.json(
      { message: 'User registered successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
