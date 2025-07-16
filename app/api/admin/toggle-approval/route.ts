/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/toggle-approval/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  // Basic admin check: Only a specific email can access this (replace with role-based auth in production)
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL || session?.user?.email === 'admin@example.com';

  if (!session || !isAdmin) {
    return NextResponse.json({ message: 'Unauthorized access' }, { status: 403 });
  }

  try {
    const { userId, isApproved } = await req.json();

    if (!userId || typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { message: 'User ID and approval status are required.' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isApproved: isApproved },
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from the response

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'User approval status updated successfully!', user: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Admin toggle approval API error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}