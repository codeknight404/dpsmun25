/* eslint-disable @next/next/no-img-element */
// app/dashboard/page.tsx
'use client';

import AuthNavButtons from '@/app/components/AuthNavButtonsForDash';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isProfileComplete?: boolean;
  committee?: string;
  portfolio?: string;
  class?: string;
  school?: string;
};

type SessionData = {
  user?: SessionUser;
};

export default function DashboardPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession() as { data: SessionData | null, status: string };
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && !session?.user?.isProfileComplete) {
      router.push('/onboarding');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen text-[#1A522A]">Loading user data...</div>;
  }

  if (status === 'authenticated' && session?.user?.isProfileComplete) {
    return (<div>
            {/* Header Section */}
            
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-filter backdrop-blur-lg shadow-sm"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Image src="/logo1.png" alt="DPS MUN Logo" width={48} height={48} className="rounded-full" />
            <span className="text-2xl font-bold text-[#1A522A]">DPS MUN 8.0</span>
          </div>
                    <nav className="hidden md:flex space-x-8">
                                {['Home', 'About', 'Committees', 'Timeline'].map((item) => (
                                  <motion.a
                                    key={item}
                                    href={`/#${item.toLowerCase()}`}
                                    whileHover={{ scale: 1.1 }}
                                    className="px-4 py-2 rounded-full transition-all duration-300 text-gray-600 hover:text-[#1A522A]"
                                  >
                                    {item}
                                  </motion.a>
                                ))}
                              </nav>

          {/* Desktop Auth Buttons: Use the AuthNavButtons component */}
          <div className="hidden md:flex">
            <AuthNavButtons />
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-6 py-4 space-y-4">
                {['Home', 'About', 'Committees', 'Timeline'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block py-2 text-gray-600 hover:text-[#1A522A] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {/* Mobile Auth Buttons: Use AuthNavButtons here too */}
                  <AuthNavButtons />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-[#1A522A]">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg w-full">
          <h2 className="text-3xl font-bold mb-4">Welcome, {session.user?.name || session.user?.email}!</h2>
          <p className="text-gray-700 mb-6">This is your secure dashboard. Your profile is complete.</p>

          <div className="space-y-3 mb-6 text-left inline-block">
            {session.user.image && (
              <div className="mt-4">
                <img src={session.user.image} alt="Profile" className="w-20 h-20 rounded-full mx-auto" width={80} height={80} />
              </div>
            )}
            <p><strong>Email:</strong> {session.user.email}</p>
            {session.user.committee && <p><strong>Committee:</strong> {session.user.committee}</p>}
            {session.user.portfolio && <p><strong>Portfolio:</strong> {session.user.portfolio}</p>}
            {session.user.class && <p><strong>Class/Grade:</strong> {session.user.class}</p>}
            {session.user.school && <p><strong>School:</strong> {session.user.school}</p>}
            
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/" className="inline-block">
                <Button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md">
                    Go to Home
                </Button>
            </Link>
          </div>
        </div>
      </div>
      </div>
    );
  }

  return null;
}