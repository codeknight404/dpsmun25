/* eslint-disable @typescript-eslint/no-unused-vars */
// app/components/AuthNavButtonsForDash.tsx
'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthNavButtonsForDash() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading') {
    return (
      <div className="flex space-x-2">
        <Button disabled variant="outline" className="px-4 py-2 rounded-full border border-[#1A522A] text-[#1A522A]">
          Loading...
        </Button>
      </div>
    );
  }

  if (status === 'authenticated') {
    const isProfileComplete = session?.user?.isProfileComplete;
    const isApproved = session?.user?.isApproved;

    return (
      <div className="flex items-center space-x-2">
        {isProfileComplete && isApproved ? (
          // Fully approved user - show Dashboard and Logout
          <Button asChild className="px-4 py-2 rounded-full bg-gradient-to-r from-[#1A522A] to-[#2E8B57] text-white hover:from-[#2E8B57] hover:to-[#1A522A] transition-colors">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        ) : isProfileComplete && !isApproved ? (
          // Profile complete but pending approval
          <Button asChild className="px-4 py-2 rounded-full bg-yellow-600 text-white hover:bg-yellow-700 transition-colors">
            <Link href="/pending-approval">Pending Approval</Link>
          </Button>
        ) : (
          // Profile incomplete - redirect to onboarding
          <Button asChild className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <Link href="/onboarding">Complete Profile</Link>
          </Button>
        )}
        <Button onClick={handleLogout} variant="outline" className="px-4 py-2 rounded-full border border-[#1A522A] text-[#1A522A] hover:bg-gray-100 transition-colors">
          Logout
        </Button>
      </div>
    );
  }

  // Not authenticated - show Login and Register
  return (
    <div className="flex space-x-2">
      <Button asChild variant="outline" className="px-4 py-2 rounded-full border border-[#1A522A] text-[#1A522A] hover:bg-gray-100 transition-colors">
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild className="px-4 py-2 rounded-full bg-gradient-to-r from-[#1A522A] to-[#2E8B57] text-white hover:from-[#2E8B57] hover:to-[#1A522A] transition-colors">
        <Link href="/register">Register</Link>
      </Button>
    </div>
  );
}