// app/pending-approval/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AuthNavButtons from '@/app/components/AuthNavButtonsForDash';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';


export default function PendingApprovalPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('--- useEffect Re-run (Pending Approval) ---');
    console.log('Current Session Status (Pending Approval useEffect):', status);
    console.log('Current isProfileComplete (Pending Approval useEffect):', session?.user?.isProfileComplete);
    console.log('Current isApproved (Pending Approval useEffect):', session?.user?.isApproved);

    if (status === 'unauthenticated') {
      console.log('Pending Approval useEffect: Unauthenticated. Redirecting to /login');
      router.push('/login');
    } else if (status === 'authenticated') {
      if (!session?.user?.isProfileComplete) {
        console.log('Pending Approval useEffect: Profile incomplete. Redirecting to /onboarding');
        router.push('/onboarding');
      } else if (session?.user?.isProfileComplete && session?.user?.isApproved) {
        console.log('Pending Approval useEffect: Profile complete and APPROVED! Redirecting to /dashboard');
        router.push('/dashboard');
      }
    }
  }, [session, status, router]);

  const handleRefreshSession = async () => {
    // This will force a session refresh, which re-runs the JWT and session callbacks
    // and updates the client-side session with the latest data from the database.
    console.log('Refreshing session to check approval status...');
    await update();
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen text-[#1A522A]">Loading...</div>;
  }

  // Only render this page if authenticated, profile is complete, and NOT approved
  if (status === 'authenticated' && session?.user?.isProfileComplete && !session?.user?.isApproved) {
    return (
      <div>
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

        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-[#1A522A] text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-3xl font-bold mb-4">Account Pending Approval</h2>
            <p className="text-gray-700 mb-6">
              Thank you for completing your profile, {session?.user?.name || session?.user?.email}!
            </p>
            <p className="text-gray-700 mb-6">
              Your account is currently under review by our administrators. You will be able to access the full dashboard once your account is approved.
            </p>
            <p className="text-gray-700 mb-6">
              Please check back later or contact support if you have any questions.
            </p>
            <Button
              onClick={handleRefreshSession}
              className="bg-gradient-to-r from-[#1A522A] to-[#2E8B57] text-white px-6 py-3 rounded-md hover:from-[#2E8B57] hover:to-[#1A522A] transition-colors"
            >
              Check Approval Status
            </Button>
            <div className="mt-4">
              <Link href="/" passHref>
                <Button variant="outline" className="px-6 py-3 rounded-md border border-[#1A522A] text-[#1A522A] hover:bg-gray-100 transition-colors">
                  Go to Home Page
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