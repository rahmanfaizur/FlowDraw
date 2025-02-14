'use client';

import { ArrowRight, Brush, Share2, Sparkles, Users2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className={`space-y-8 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-center space-x-2 text-blue-400">
            <Brush className="w-6 h-6" />
            <h1 className="text-2xl font-bold">FlowDraw</h1>
          </div>
          
          <h2 className="text-center text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Visualize Your Ideas
            <br />
            With Infinite Possibilities
          </h2>
          
          <p className="text-center text-xl text-gray-400 max-w-2xl mx-auto">
            Create beautiful diagrams, flowcharts, and sketches with our intuitive drawing tool. 
            Collaborate in real-time and bring your ideas to life.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link href={'/signin'}>
            <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold flex items-center space-x-2 transition-all hover:scale-105">
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            </Link>
            <Link href={'/signup'}>
            <button className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all hover:scale-105">
              Sign Up
            </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Sparkles className="w-8 h-8 text-blue-400" />}
            title="Intuitive Drawing"
            description="Create professional diagrams with our easy-to-use tools. Perfect for flowcharts, wireframes, and mind maps."
            delay={100}
          />
          <FeatureCard 
            icon={<Users2 className="w-8 h-8 text-purple-400" />}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
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