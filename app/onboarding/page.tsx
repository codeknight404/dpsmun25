/* eslint-disable @typescript-eslint/no-explicit-any */
// app/onboarding/page.tsx
'use client';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthNavButtons from '@/app/components/AuthNavButtonsForDash';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

// Extend the NextAuth session user type to include custom fields

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string | null; // Add id here if it's coming from session
      name?: string | null;
      email?: string | null;
      image?: string | null;
      portfolio?: string;
      class?: string;
      school?: string;
      isProfileComplete?: boolean; // Ensure this is boolean
      committee?: string;
    };
  }
}


export default function OnboardingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [committee, setCommittee] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [userClass, setUserClass] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('--- useEffect Re-run (Onboarding) ---');
    console.log('Current Session Status (Onboarding useEffect):', status);
    console.log('Current isProfileComplete (from session in Onboarding useEffect):', session?.user?.isProfileComplete);
    console.log('Full Session Object (Onboarding useEffect):', JSON.stringify(session, null, 2)); // Log entire session for inspection

    if (status === 'unauthenticated') {
      console.log('Onboarding useEffect: Unauthenticated. Redirecting to /login');
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.isProfileComplete === true) { // Explicitly check for true
      console.log('Onboarding useEffect: Authenticated and Profile Complete. Redirecting to /dashboard');
      router.push('/dashboard');
    } else if (status === 'authenticated' && session?.user?.isProfileComplete === false) { // Explicitly check for false
      console.log('Onboarding useEffect: Authenticated and Profile INCOMPLETE. Displaying form.');
      // Pre-fill form if there's any existing partial data
      setCommittee(session.user.committee || '');
      setPortfolio(session.user.portfolio || '');
      setUserClass(session.user.class || '');
      setSchool(session.user.school || '');
    } else if (status === 'authenticated' && session?.user && session.user.isProfileComplete === undefined) {
        // This case indicates that 'isProfileComplete' isn't even making it into the session initially.
        console.warn('Onboarding useEffect: Authenticated but isProfileComplete is UNDEFINED. This is problematic.');
        setCommittee(session.user.committee || '');
        setPortfolio(session.user.portfolio || '');
        setUserClass(session.user.class || '');
        setSchool(session.user.school || '');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    console.log('--- Form Submission Started (Onboarding) ---');
    console.log('Submitting data (Onboarding form):', { committee, portfolio, userClass, school });

    if (!committee || !portfolio || !userClass || !school) {
      setError('Please fill in all required fields.');
      setLoading(false);
      console.log('Onboarding form: Validation failed - Missing fields.');
      return;
    }

    try {
      const response = await fetch('/api/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          committee,
          portfolio,
          class: userClass,
          school,
        }),
      });

      const data = await response.json();
      console.log('Onboarding form: API Response Status:', response.status);
      console.log('Onboarding form: API Response Body:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        setError(data.message || 'Failed to update profile.');
        console.error('Onboarding form: API Error:', data.message || 'Failed to update profile.');
      } else {
        console.log('Onboarding form: Profile update API call successful. Initiating session update.');
        alert('Profile completed successfully! Please wait for redirection...'); // Keep alert to give time to read logs

        // The update() call will trigger a session refresh.
        // Once the session is refreshed and isProfileComplete is true,
        // the useEffect above will trigger the router.push('/dashboard').
        await update({
          user: {
            committee,
            portfolio,
            class: userClass,
            school,
            isProfileComplete: true, // This is the crucial flag we're setting in the session
          },
        });
        console.log('Onboarding form: Session update initiated. Expecting useEffect to re-run and redirect.');
        // DO NOT router.push('/dashboard') here. Let the useEffect handle it.
      }
    } catch (err: any) {
      console.error('Onboarding form: Submission error in catch block:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      console.log('--- Form Submission Ended (Onboarding) ---');
    }
  };

  if (status === 'loading' || (status === 'authenticated' && session?.user?.isProfileComplete)) {
    return <div className="flex justify-center items-center min-h-screen text-[#1A522A]">Loading...</div>;
  }

  if (status === 'authenticated' && !session?.user?.isProfileComplete) {
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
      
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-[#1A522A]">
          <h2 className="text-3xl font-bold text-center mb-6">Complete Your Profile</h2>
          <p className="text-center text-gray-600 mb-6">Just a few more details to get started with DPS MUN!</p>
          {error && (
            <p className="text-red-500 text-center mb-4">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="committee" className="block text-sm font-medium text-gray-700 mb-1">Committee</Label>
              <Input
                type="text"
                id="committee"
                value={committee}
                onChange={(e) => setCommittee(e.target.value)}
                placeholder="e.g., United Nations Security Council"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
              />
            </div>
            <div>
              <Label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1">Portfolio (Country/Role)</Label>
              <Input
                type="text"
                id="portfolio"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="e.g., Delegate of USA"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
              />
            </div>
            <div>
              <Label htmlFor="userClass" className="block text-sm font-medium text-gray-700 mb-1">Class/Grade</Label>
              <Input
                type="text"
                id="userClass"
                value={userClass}
                onChange={(e) => setUserClass(e.target.value)}
                placeholder="e.g., 10th Grade"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
              />
            </div>
            <div>
              <Label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">School</Label>
              <Input
                type="text"
                id="school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g., Delhi Public School Jodhpur"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1A522A] to-[#2E8B57] text-white px-4 py-2 rounded-md hover:from-[#2E8B57] hover:to-[#1A522A] transition-colors"
            >
              {loading ? 'Saving...' : 'Complete Registration'}
            </Button>
          </form>
        </div>
      </div>
      </div>
    );
  }

  return null;
}