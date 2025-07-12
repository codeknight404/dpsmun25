/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/register/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
        return NextResponse.json(
            { message: 'Password must be at least 6 characters long.' },
            { status: 400 }
        );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists.' },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      name,
      email,
      password,
      isProfileComplete: true, // Credentials users are complete by default
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { message: 'User registered successfully!', user: userResponse },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration API error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'A user with this email already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}