import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

function getRedirect(role) {
  if (role === 'admin') return '/admin';
  if (role === 'company') return '/company/dashboard';
  return '/ai-matches';
}

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(getRedirect(user.role));
  }, [user, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900">Welcome Back</h1>
          <p className="text-navy-400 mt-2">Sign in to your NexGen Hire account</p>
        </div>
        <div className="card">
          <LoginForm />
          <p className="text-center text-sm text-navy-400 mt-6">
            Don't have an account? <Link to="/register" className="text-gold-600 font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
