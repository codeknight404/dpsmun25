// app/components/AuthNavButtons.tsx
'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CircleUserRound, DoorOpen, UserRound } from 'lucide-react';

export default function AuthNavButtons() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-[#1A522A] flex justify-center items-center"><UserRound /> User</div>;
  }

  if (status === 'authenticated') {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-[#1A522A] font-medium hidden lg:inline-flex gap-3 rounded-2xl px-4 py-2 bg-[#ffffff] shadow-md">
          <CircleUserRound /> {session.user?.name || session.user?.email?.split('@')[0]}!
        </span>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-teal-600 text-white hover:bg-teal-800 shadow-lg"
          >
            <DoorOpen /> Log-out
          </Button>
        </motion.div>
      </div>
    );
  }

  // If unauthenticated
  return (
    <div className="flex space-x-4">
      <Link href="/login">
        <Button variant="ghost" className="text-[#1A522A] hover:bg-gradient-to-r from-[#D6EEF8] to-[#E0F3F9]">
          Login
        </Button>
      </Link>
      <Link href="/register">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-gradient-to-r from-[#1A522A] to-[#2E8B57] text-white hover:from-[#2E8B57] hover:to-[#1A522A] shadow-lg">
            Register Now
          </Button>
        </motion.div>
      </Link>
    </div>
  );
}