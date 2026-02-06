import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void; // ✅ FIXED
  onNavigateToRegister: () => void;
}

export function LoginPage({ onLogin, onNavigateToRegister }: LoginPageProps) {
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ SEND EMAIL + PASSWORD (role comes from backend)
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-200 to-purple-300 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-40 h-40 bg-white/30 rounded-full blur-2xl"></div>
      <div className="absolute bottom-32 right-32 w-60 h-60 bg-white/20 rounded-full blur-3xl"></div>
      
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
            LearnSphere
          </h1>
          <p className="text-gray-600 text-sm">
            Personalized AI Tutoring Enhanced by Human Guidance
          </p>
        </div>

        {/* User Type Toggle (UI only, backend decides role) */}
        <div className="flex gap-2 mb-8">
          <button
            type="button"
            onClick={() => setUserType('student')}
            className={`flex-1 py-3 rounded-xl ${
              userType === 'student'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setUserType('teacher')}
            className={`flex-1 py-3 rounded-xl ${
              userType === 'teacher'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Teacher
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 bg-gray-50 border rounded-xl"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 bg-gray-50 border rounded-xl"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Don't have an account?{' '}
          <button onClick={onNavigateToRegister} className="text-blue-600 hover:underline">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}
