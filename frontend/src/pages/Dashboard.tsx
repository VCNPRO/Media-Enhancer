import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Plus, Video, UserCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold">Media Enhancer</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-gray-300 hover:text-white">
              Upgrade
            </Link>
            <div className="flex items-center gap-2">
              <UserCircle className="w-6 h-6" />
              <span>{user?.firstName || user?.emailAddresses[0]?.emailAddress}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName || 'there'}!</h1>
          <p className="text-gray-400">Create and manage your video projects</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-1">Storage Used</h3>
            <p className="text-3xl font-bold text-blue-500">0 GB</p>
            <p className="text-sm text-gray-400">of 5 GB</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-1">Projects</h3>
            <p className="text-3xl font-bold text-green-500">0</p>
            <p className="text-sm text-gray-400">of 10 projects</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-1">Exports</h3>
            <p className="text-3xl font-bold text-purple-500">0</p>
            <p className="text-sm text-gray-400">this month</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-1">Current Plan</h3>
            <p className="text-3xl font-bold text-yellow-500">Starter</p>
            <Link to="/pricing" className="text-sm text-blue-400 hover:underline">
              Upgrade
            </Link>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Projects</h2>
            <Link
              to="/editor"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              New Project
            </Link>
          </div>

          {/* Empty State */}
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first video project to get started
            </p>
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
