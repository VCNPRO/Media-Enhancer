import { Link } from 'react-router-dom';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Video, Sparkles, Zap, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Video className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold">Media Enhancer</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/pricing" className="hover:text-blue-400 transition">
            Pricing
          </Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            AI-Powered Video & Audio Editing
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Create stunning videos with the power of artificial intelligence.
            Upload, edit, enhance, and export professional-quality content in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <SignUpButton mode="modal">
              <button className="px-8 py-4 bg-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
                Start Free Trial
              </button>
            </SignUpButton>
            <Link
              to="/pricing"
              className="px-8 py-4 border border-gray-500 rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-gray-800 p-8 rounded-xl">
            <Sparkles className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">AI Enhancement</h3>
            <p className="text-gray-400">
              Automatically improve video quality, remove noise, and enhance colors with AI.
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-xl">
            <Zap className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-gray-400">
              Process and export your videos up to 10x faster with our optimized pipeline.
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-xl">
            <Shield className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Secure Storage</h3>
            <p className="text-gray-400">
              Your media is encrypted and stored securely in the cloud with Cloudflare R2.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 mt-20">
        <p>&copy; 2024 Media Enhancer. All rights reserved.</p>
      </footer>
    </div>
  );
}
