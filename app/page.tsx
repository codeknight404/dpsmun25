/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import AuthNavButtons from '@/app/components/AuthNavButtons';
import React, { useState, useEffect, JSX } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming this path is correct for your Button component
import { motion, AnimatePresence, Variants, easeInOut } from 'framer-motion';
import {
  Globe,
  Users,
  Calendar,
  Trophy,
  Star,
  Award,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  CheckCircle,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  FileText,
  UserCheck,
} from 'lucide-react';
import Image from 'next/image';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' as const },
  },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const slideInLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: easeInOut },
  },
};

const slideInRight = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: easeInOut },
  },
};

// Waving Background Animation
const waveBackground: Variants = {
  wave: {
    x: ['-20%', '20%', '-20%'],
    y: ['-20%', '20%', '-20%'],
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0], // Subtle rotation
    transition: {
      duration: 30, // Slower for a more fluid wave
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Modal Animation Variants
const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: -50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.2 } },
};

// Define Committee Interface for better type safety
interface Committee {
  name: string;
  short: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  delegates: number;
  agenda: string;
  chairpersons: string[];
  rulesPdf: string; // URL to the PDF file
  type: 'International' | 'National'; // New field for committee type
}

// Committee Detail Modal Component
interface CommitteeDetailModalProps {
  committee: Committee;
  onClose: () => void;
}

const CommitteeDetailModal: React.FC<CommitteeDetailModalProps> = ({ committee, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[100] p-4"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white
        backdropFilter: 'blur(10px)', // Apply blur effect
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 max-w-xl w-full mx-auto shadow-2xl relative border border-white/20 backdrop-filter backdrop-blur-lg text-[#1A522A]"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-[#1A522A] transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-4 text-center text-[#1A522A]">
          {committee.name} ({committee.short})
        </h2>
        <p className="text-gray-700 text-center mb-6">{committee.description}</p>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#2E8B57]" /> Agenda
            </h3>
            <p className="text-gray-700">{committee.agenda}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-[#2E8B57]" /> Chairpersons
            </h3>
            <ul className="list-disc list-inside text-gray-700">
              {committee.chairpersons.map((chair, index) => (
                <li key={index}>{chair}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#2E8B57]" /> Rules of Procedure
            </h3>
            <a
              href={committee.rulesPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gradient-to-r from-[#1A522A] to-[#2E8B57] text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              View PDF
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Home(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  const [activeCommitteeType, setActiveCommitteeType] = useState<'All' | 'International' | 'National'>('All'); // New state for filtering

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      const sections = ['home', 'about', 'committees', 'timeline'];
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { icon: Trophy, number: '8', label: 'Years of Excellence', color: 'from-yellow-400 to-yellow-600' },
    { icon: Users, number: '500+', label: 'Delegates Expected', color: 'from-blue-400 to-blue-600' },
    { icon: Award, number: '15+', label: 'Dynamic Committees', color: 'from-purple-400 to-purple-600' },
    { icon: Star, number: '50+', label: 'Participating Schools', color: 'from-green-400 to-green-600' },
  ];

  const allCommittees: Committee[] = [
    {
      name: 'United Nations Security Council',
      short: 'UNSC',
      description: 'The primary body for maintaining international peace and security.',
      level: 'Advanced',
      delegates: 15,
      agenda: 'Addressing the implications of emerging technologies on international peace and security.',
      chairpersons: ['Ms. Anya Sharma', 'Mr. Rohan Gupta'],
      rulesPdf: '/rules/UNSC_ROP.pdf',
      type: 'International',
    },
    {
      name: 'United Nations General Assembly',
      short: 'UNGA',
      description: 'The main deliberative assembly of the United Nations, discussing global issues.',
      level: 'Intermediate',
      delegates: 25,
      agenda: 'Rethinking global efforts for sustainable development and climate action.',
      chairpersons: ['Dr. Priya Singh', 'Mr. Vivek Jain'],
      rulesPdf: '/rules/UNGA_ROP.pdf',
      type: 'International',
    },
    {
      name: 'United Nations Human Rights Council',
      short: 'UNHRC',
      description: 'Promoting and protecting human rights around the globe, addressing violations and challenges.',
      level: 'Advanced',
      delegates: 20,
      agenda: 'The protection of human rights in conflict-affected areas, with a focus on humanitarian access.',
      chairpersons: ['Prof. Elena Petrova', 'Ms. David Lee'],
      rulesPdf: '/rules/UNHRC_ROP.pdf',
      type: 'International',
    },
    {
      name: 'World Health Organization',
      short: 'WHO',
      description: 'Directing international health within the United Nations system, focusing on global health crises.',
      level: 'Beginner',
      delegates: 30,
      agenda: 'Global preparedness and response to future pandemics: Lessons from COVID-19.',
      chairpersons: ['Dr. Sanjeev Kumar', 'Ms. Emily White'],
      rulesPdf: '/rules/WHO_ROP.pdf',
      type: 'International',
    },
    {
      name: 'United Nations Environment Programme',
      short: 'UNEP',
      description: 'Leading global environmental action, addressing climate change and biodiversity loss.',
      level: 'Intermediate',
      delegates: 25,
      agenda: 'Strategies for promoting a circular economy and sustainable consumption patterns.',
      chairpersons: ['Ms. Sarah Khan', 'Mr. Ben Carter'],
      rulesPdf: '/rules/UNEP_ROP.pdf',
      type: 'International',
    },
    {
      name: 'International Crisis Committee',
      short: 'ICC',
      description: 'Fast-paced committee dealing with evolving global crises and requiring quick decision-making.',
      level: 'Advanced',
      delegates: 20,
      agenda: 'Responding to a rapidly escalating geopolitical crisis in the Indo-Pacific region.',
      chairpersons: ['Gen. Robert Johnson', 'Ms. Nina Patel'],
      rulesPdf: '/rules/ICC_ROP.pdf',
      type: 'International',
    },
    // --- National Committees ---
    {
      name: 'Lok Sabha',
      short: 'LS',
      description: 'The House of the People in the Indian Parliament, discussing legislative matters of national importance.',
      level: 'Intermediate',
      delegates: 40,
      agenda: 'Deliberation on the implementation of Uniform Civil Code in India.',
      chairpersons: ['Hon. Speaker Smt. Meenakshi Devi', 'Shri. Vikram Seth'],
      rulesPdf: '/rules/LS_ROP.pdf',
      type: 'National',
    },
    {
      name: 'All India Political Parties Meet',
      short: 'AIPPM',
      description: 'A dynamic committee simulating a meeting of leaders from various Indian political parties to address pressing national issues.',
      level: 'Advanced',
      delegates: 35,
      agenda: 'Discussing the future of farmer welfare policies and agricultural reforms in India.',
      chairpersons: ['Dr. Anand Verma', 'Ms. Geetanjali Rao'],
      rulesPdf: '/rules/AIPPM_ROP.pdf',
      type: 'National',
    },
  ];

  const filteredCommittees = allCommittees.filter(committee =>
    activeCommitteeType === 'All' ? true : committee.type === activeCommitteeType
  );

  const timeline = [
    { date: 'November 15, 2024', event: 'Registration Opens', status: 'completed' },
    { date: 'December 20, 2024', event: 'Early Bird Deadline', status: 'completed' },
    { date: 'January 15, 2025', event: 'Position Papers Due', status: 'current' },
    { date: 'January 25, 2025', event: 'Registration Closes', status: 'upcoming' },
    { date: 'February 14-16, 2025', event: 'Conference Dates', status: 'upcoming' },
  ];

  const highlights = [
    'Expert Chairpersons from prestigious universities',
    'Interactive workshops on diplomacy and negotiation',
    'Networking opportunities with delegates nationwide',
    'Award ceremonies and recognition',
    'Cultural evening and entertainment',
    'Professional photography and documentation',
  ];

  return (
    <div className="min-h-screen relative text-[#1A522A] font-sans overflow-x-hidden">
      {/* Dynamic Waving Background */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        <motion.div
          className="absolute w-[150vw] h-[150vh] transform -translate-x-1/2 -translate-y-1/2" // Larger to cover screen during movement
          style={{
            background: 'radial-gradient(circle at 60% 40%, #D6EEF8 0%, #E0F3F9 25%, #E6FFE6 50%, #F0E6F7 75%, #F8E0DE 100%)',
            filter: 'blur(150px)', // Stronger blur for fluid effect
            opacity: 0.8,
          }}
          // Apply the variants here, and then specify which variant to animate
          variants={waveBackground} // <--- Pass the variant object here
          animate="wave"           // <--- Tell Framer Motion to animate the 'wave' variant
        />
      </div>

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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {['Home', 'About', 'Committees', 'Timeline'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
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

      {/* Hero Section */}
      <section id="home" className="relative pt-24 pb-16 min-h-screen flex items-center overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div initial="hidden" animate="visible" variants={staggerChildren} className="text-center lg:text-left">
              <motion.div variants={fadeInUp} className="mb-6">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#D6EEF8] to-[#E0F3F9] text-[#1A522A] rounded-full text-sm font-semibold mb-4">
                  🎉 8th Annual Conference
                </span>
                <h1 className="text-5xl md:text-7xl font-bold text-[#1A522A] mb-6 leading-tight">
                  DPS MUN
                  <span className="block text-3xl md:text-4xl text-[#2E8B57] font-light">Jodhpur 2025</span>
                </h1>
              </motion.div>

              <motion.p variants={fadeInUp} className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Join us for an extraordinary diplomatic experience at Delhi Public School Jodhpur&apos;s flagship Model United Nations
                conference. Where young minds shape the future through debate, diplomacy, and international cooperation.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-[#1A522A] to-[#2E8B57] text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group">
                      Register Now
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="#about">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="border-2 border-[#1A522A] text-[#1A522A] hover:bg-[#1A522A] hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                    >
                      Learn More
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Quick Info */}
              <motion.div variants={fadeInUp} className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <Calendar className="w-5 h-5 text-[#2E8B57]" />
                  <span className="text-sm text-gray-600">Feb 14-16, 2025</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <MapPin className="w-5 h-5 text-[#2E8B57]" />
                  <span className="text-sm text-gray-600">DPS Jodhpur</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <Users className="w-5 h-5 text-[#2E8B57]" />
                  <span className="text-sm text-gray-600">500+ Delegates</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Visual (Glassmorphism) */}
            <motion.div initial="hidden" animate="visible" variants={slideInRight} className="relative">
              <div className="relative p-8 rounded-3xl shadow-2xl backdrop-filter backdrop-blur-lg bg-white/30 border border-white/20">
                <div className="text-center mb-6">
                  <div className="w-50 h-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image src="/logo1.png" alt="DPM MUN Logo" width={200} height={200} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A522A] mb-2">Conference Overview</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/40 rounded-lg border border-white/20">
                    <span className="text-sm font-medium text-gray-700">Duration</span>
                    <span className="text-sm text-[#1A522A] font-bold">3 Days</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/40 rounded-lg border border-white/20">
                    <span className="text-sm font-medium text-gray-700">Committees</span>
                    <span className="text-sm text-[#1A522A] font-bold">15+ Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/40 rounded-lg border border-white/20">
                    <span className="text-sm font-medium text-gray-700">Awards</span>
                    <span className="text-sm text-[#1A522A] font-bold">Multiple Categories</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/40 rounded-lg border border-white/20">
                    <span className="text-sm font-medium text-gray-700">Experience Level</span>
                    <span className="text-sm text-[#1A522A] font-bold">All Levels</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/80 backdrop-filter backdrop-blur-md">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 rounded-2xl bg-white/50 backdrop-filter backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-full mb-4 shadow-lg`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-[#1A522A] mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 backdrop-filter backdrop-blur-md">
        <div className="mt-20 container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A522A] mb-6">About DPS MUN Jodhpur</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              For eight consecutive years, DPS MUN Jodhpur has been at the forefront of diplomatic education, fostering critical
              thinking, public speaking, and international awareness among young minds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInLeft}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-[#1A522A] mb-6">Why Choose DPS MUN?</h3>
              <div className="space-y-4">
                {highlights.map((highlight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-[#2E8B57] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-relaxed">{highlight}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInRight}
              className="relative"
            >
              <div className="bg-white/50 p-8 rounded-3xl shadow-2xl backdrop-filter backdrop-blur-lg border border-white/20">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#1A522A] to-[#2E8B57] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-[#1A522A] mb-2">Legacy of Excellence</h4>
                  <p className="text-gray-600">Building future leaders since 2017</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/40 p-4 rounded-lg border border-white/20">
                    <h5 className="font-semibold text-[#1A522A] mb-2">Past Achievements</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 3,000+ delegates trained</li>
                      <li>• 100+ schools participated</li>
                      <li>• 15+ countries represented</li>
                      <li>• 90% delegate satisfaction rate</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Committees Section */}
      <section id="committees" className="py-20 bg-white/80 backdrop-filter backdrop-blur-md">
        <div className="mt-20 container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-center mb-10"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A522A] mb-6">Our Committees</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Diverse committees offering unique perspectives on global challenges and opportunities for delegates of all experience
              levels.
            </p>
          </motion.div>

          {/* Committee Type Filters */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="flex justify-center gap-4 mb-12"
          >
            <Button
              variant={activeCommitteeType === 'All' ? 'default' : 'outline'}
              onClick={() => setActiveCommitteeType('All')}
              className={`${
                activeCommitteeType === 'All'
                  ? 'bg-gradient-to-r from-[#1A522A] to-[#2E8B57] text-white'
                  : 'border-[#1A522A] text-[#1A522A] hover:bg-[#D6EEF8]'
              }`}
            >
              All Committees
            </Button>
            <Button
              variant={activeCommitteeType === 'International' ? 'default' : 'outline'}
              onClick={() => setActiveCommitteeType('International')}
              className={`${
                activeCommitteeType === 'International'
                  ? 'bg-gradient-to-r from-[#1A522A] to-[#2E8B57] text-white'
                  : 'border-[#1A522A] text-[#1A522A] hover:bg-[#D6EEF8]'
              }`}
            >
              International
            </Button>
            <Button
              variant={activeCommitteeType === 'National' ? 'default' : 'outline'}
              onClick={() => setActiveCommitteeType('National')}
              className={`${
                activeCommitteeType === 'National'
                  ? 'bg-gradient-to-r from-[#1A522A] to-[#2E8B57] text-white'
                  : 'border-[#1A522A] text-[#1A522A] hover:bg-[#D6EEF8]'
              }`}
            >
              National
            </Button>
          </motion.div>

          {/* Committee Grid - AnimatePresence ensures smooth filtering transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              // Key the grid itself to trigger re-animation of its children when filter changes
              key={activeCommitteeType}
              initial="hidden"
              animate="visible"
              // variants={staggerChildren} // Apply stagger to the grid container
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              // Instead of staggerChildren on the parent, we'll apply individual animations with a delay
            >
              {filteredCommittees.map((committee, index) => (
                <motion.div
                  key={committee.name} // Unique key for each committee card for Framer Motion
                  variants={scaleIn}
                  initial="hidden" // Ensure individual cards start from hidden
                  animate="visible" // Animate them to visible
                  exit="hidden" // Animate them to hidden when removed from the DOM
                  transition={{ delay: index * 0.05 }} // Optional: Add a slight delay for staggered entry
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 backdrop-filter backdrop-blur-lg cursor-pointer"
                  onClick={() => setSelectedCommittee(committee)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#1A522A]">{committee.short}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        committee.level === 'Beginner'
                          ? 'bg-green-100 text-green-800'
                          : committee.level === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {committee.level}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">{committee.name}</h4>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{committee.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Delegates: {committee.delegates}</span>
                    <button className="text-[#2E8B57] hover:text-[#1A522A] transition-colors focus:outline-none">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-20 backdrop-filter backdrop-blur-md">
        <div className="mt-20 container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A522A] mb-6">Important Timeline</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">Stay updated with key dates and deadlines for DPS MUN 8.0</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
            className="max-w-4xl mx-auto"
          >
            {timeline.map((item, index) => (
              <motion.div key={index} variants={fadeInUp} className="flex items-center mb-8 last:mb-0">
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-[#1A522A] to-[#2E8B57] mr-6 relative">
                  {index < timeline.length - 1 && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-px h-12 bg-gradient-to-b from-[#1A522A] to-[#2E8B57]"></div>
                  )}
                </div>
                <div
                  className={`flex-1 p-6 rounded-xl ${
                    item.status === 'completed'
                      ? 'bg-green-50/70 border-l-4 border-green-500 backdrop-filter backdrop-blur-sm'
                      : item.status === 'current'
                        ? 'bg-yellow-50/70 border-l-4 border-yellow-500 backdrop-filter backdrop-blur-sm'
                        : 'bg-gray-50/70 border-l-4 border-gray-300 backdrop-filter backdrop-blur-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1A522A] mb-1">{item.event}</h3>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.status === 'completed'
                          ? 'bg-green-500'
                          : item.status === 'current'
                            ? 'bg-yellow-500'
                            : 'bg-gray-300'
                      }`}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A522A] text-white py-12">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Logo and Tagline */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-[#2E8B57] rounded-full flex items-center justify-center">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold">DPS MUN 8.0</h3>
            </div>
            <p className="text-white/80 text-sm">Shaping future diplomats</p>
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h4 className="text-xl font-semibold mb-4 text-[#E6FFE6]">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="#about" className="text-white/80 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#committees" className="text-white/80 hover:text-white transition-colors">Committees</Link></li>
              <li><Link href="#timeline" className="text-white/80 hover:text-white transition-colors">Timeline</Link></li>
              <li><Link href="/login" className="text-white/80 hover:text-white transition-colors">Login</Link></li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <h4 className="text-xl font-semibold mb-4 text-[#E6FFE6]">Contact Us</h4>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-center justify-center md:justify-start">
                <MapPin className="w-5 h-5 mr-2" />
                <span>Delhi Public School, Jodhpur</span>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Mail className="w-5 h-5 mr-2" />
                <span>dpsmunjodhpur@gmail.com</span>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Phone className="w-5 h-5 mr-2" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="border-t border-[#2E8B57] mt-10 pt-8 text-center text-white/60 text-sm">
          &copy; {new Date().getFullYear()} DPS MUN Jodhpur. All rights reserved.
        </div>
      </footer>

      {/* Committee Detail Modal */}
      <AnimatePresence>
        {selectedCommittee && (
          <CommitteeDetailModal
            committee={selectedCommittee}
            onClose={() => setSelectedCommittee(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}