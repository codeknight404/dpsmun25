/* eslint-disable @typescript-eslint/no-explicit-any */
// app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import AuthNavButtons from '@/app/components/AuthNavButtonsForDash';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { FaGoogle } from 'react-icons/fa'; // Only Google icon now

export default function LoginPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setError(null);
    setLoading(true);
    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: '/',
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || `An unexpected error occurred with ${provider} login.`);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-3xl font-bold text-center mb-6">Login to DPS MUN</h2>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          <p className="mb-3">Or sign in with:</p>
          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => handleSocialSignIn('google')}
              disabled={loading}
              className="w-full hover:bg-[#0b3d50] bg-teal-900 text-white flex items-center justify-center space-x-2 px-4 rounded-md transition-colors p-6"
            >
              <FaGoogle /> <span>Sign in with Google</span>
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#2E8B57] hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
    </div>
  );
}