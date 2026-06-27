import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center text-navy-900 mb-4">Contact Us</h1>
      <p className="text-center text-navy-400 mb-12">Have questions? We'd love to hear from you.</p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {[
            { icon: Mail, label: 'Email', value: 'hello@techbridgeafrica.com' },
            { icon: MapPin, label: 'Location', value: 'Johannesburg, South Africa' },
            { icon: Phone, label: 'Phone', value: '+27 11 000 0000' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-navy-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <item.icon className="text-gold-500" size={20} />
              </div>
              <div>
                <p className="font-medium text-navy-900">{item.label}</p>
                <p className="text-navy-400">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <Input label="Name" value={form.name} onChange={set('name')} required />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea value={form.message} onChange={set('message')} className="input-field h-32 resize-none" required />
          </div>
          <Button type="submit" disabled={sending} className="w-full">
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </div>
  );
}
