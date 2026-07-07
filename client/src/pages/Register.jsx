import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(user.role === 'company' ? '/company/profile' : user.role === 'university' ? '/university/dashboard' : '/student/profile');
  }, [user, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900">Join NexGen Hire</h1>
          <p className="text-navy-400 mt-2">Start your journey to a tech career</p>
        </div>
        <div className="card">
          <RegisterForm />
          <p className="text-center text-sm text-navy-400 mt-6">
            Already have an account? <Link to="/login" className="text-gold-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
