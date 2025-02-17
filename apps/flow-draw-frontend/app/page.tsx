'use client';

import { ArrowRight, Brush, Share2, Sparkles, Users2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader'; // Import the Loader component

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true); // State to control loading

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setLoading(false); // Hide loader after loading is done
    }, 2000); // Simulate loading time
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {loading && <Loader />} {/* Show loader when loading is true */}

      {/* Funky Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-pink-500 to-blue-500 opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-full h-full bg-[url('https://placehold.co/600x600')] bg-cover opacity-20"></div>
        </div>
        <div className="absolute w-full h-full flex flex-col items-center justify-center">
          <div className="animate-pulse text-6xl text-yellow-300">🎉</div>
          <div className="animate-pulse text-6xl text-green-300">✨</div>
          <div className="animate-pulse text-6xl text-red-300">🌈</div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 z-10 relative">
        <div className={`space-y-8 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-center space-x-2 text-blue-400">
            <Brush className="w-6 h-6" />
            <h1 className="text-3xl font-bold">FlowDraw</h1>
          </div>
          
          <h2 className="text-center text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400">
            Visualize Your Ideas
            <br />
            With Infinite Possibilities
          </h2>
          
          <p className="text-center text-xl text-gray-300 max-w-2xl mx-auto">
            Create beautiful diagrams, flowcharts, and sketches with our intuitive drawing tool. 
            Collaborate in real-time and bring your ideas to life.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link href={'/signin'}>
              <button className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold flex items-center space-x-2 transition-all hover:scale-105">
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href={'/signup'}>
              <button className="px-8 py-3 bg-purple-700 hover:bg-purple-600 rounded-lg font-semibold transition-all hover:scale-105">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 relative">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Sparkles className="w-8 h-8 text-yellow-400" />}
            title="Intuitive Drawing"
            description="Create professional diagrams with our easy-to-use tools. Perfect for flowcharts, wireframes, and mind maps."
            delay={100}
          />
          <FeatureCard 
            icon={<Users2 className="w-8 h-8 text-green-400" />}
            title="Real-time Collaboration"
            description="Work together with your team in real-time. See changes instantly and collaborate seamlessly."
            delay={200}
          />
          <FeatureCard 
            icon={<Share2 className="w-8 h-8 text-pink-400" />}
            title="Easy Sharing"
            description="Share your drawings with a single click. Export to multiple formats or generate shareable links."
            delay={300}
          />
        </div>
      </div>

      {/* Preview Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 relative">
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-pink-500/10 to-purple-500/10"></div>
          <img 
            src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=2000&q=80" 
            alt="FlowDraw Interface Preview" 
            className="w-full h-[600px] object-cover rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`bg-gray-800 p-6 rounded-xl transition-all duration-1000 transform ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      <div className="space-y-4">
        {icon}
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}