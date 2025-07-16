/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  // Basic admin check: Only a specific email can access this (replace with role-based auth in production)
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL || session?.user?.email === 'admin@example.com';

  if (!session || !isAdmin) {
    return NextResponse.json({ message: 'Unauthorized access' }, { status: 403 });
  }

  try {
    // Fetch all users, but exclude their passwords for security
    const users = await User.find({}).select('-password');

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error('Admin get users API error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}