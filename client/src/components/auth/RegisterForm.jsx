import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export default function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', companyName: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={() => setForm({ ...form, role: 'student' })}
          className={`flex-1 py-2 rounded-lg font-medium border-2 transition-colors ${form.role === 'student' ? 'border-navy-800 bg-navy-50 text-navy-800' : 'border-gray-200 text-gray-500'}`}>
          Student
        </button>
        <button type="button" onClick={() => setForm({ ...form, role: 'company' })}
          className={`flex-1 py-2 rounded-lg font-medium border-2 transition-colors ${form.role === 'company' ? 'border-navy-800 bg-navy-50 text-navy-800' : 'border-gray-200 text-gray-500'}`}>
          Company
        </button>
      </div>
      <Input label="Full Name" value={form.name} onChange={set('name')} required />
      {form.role === 'company' && (
        <Input label="Company Name" value={form.companyName} onChange={set('companyName')} required />
      )}
      <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
      <Input label="Password" type="password" value={form.password} onChange={set('password')} required placeholder="Min 8 characters" />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}
