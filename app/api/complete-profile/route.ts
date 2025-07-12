/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/complete-profile/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { committee, portfolio, class: userClass, school } = await req.json();

    if (!committee || !portfolio || !userClass || !school) {
      return NextResponse.json(
        { message: 'Please provide all required profile details.' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        committee,
        portfolio,
        class: userClass,
        school,
        isProfileComplete: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { message: 'Profile updated successfully!', user: userResponse },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}