import { Target, Globe, Sparkles, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-navy-900 mb-4">About NexGen Hire</h1>
        <p className="text-lg text-navy-400 max-w-2xl mx-auto">
          We're building the bridge between Africa's brightest tech students and the companies shaping the continent's digital future.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {[
          { icon: Target, title: 'Our Mission', desc: 'To eliminate the gap between African tech talent and opportunity by using AI to connect students with the right roles at the right time.' },
          { icon: Globe, title: 'Our Reach', desc: 'Starting in South Africa and Zimbabwe, expanding across the continent. We serve students from all major African universities.' },
          { icon: Sparkles, title: 'AI Matching', desc: 'Our matching engine analyzes your skills against job requirements, giving you a clear percentage match so you apply where you fit best.' },
          { icon: Users, title: 'Community', desc: 'More than a job board — we are a community of tech students, mentors, and companies committed to growing Africa\'s tech ecosystem.' },
        ].map((item) => (
          <div key={item.title} className="card">
            <item.icon className="text-gold-500 mb-3" size={28} />
            <h3 className="text-xl font-semibold text-navy-900 mb-2">{item.title}</h3>
            <p className="text-navy-400">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="card bg-navy-900 text-white text-center border-none">
        <h2 className="text-2xl font-bold mb-2">Built for Africa, by Africa</h2>
        <p className="text-navy-200">
          With 230 million projected digital jobs by 2030, Africa's tech future is now. NexGen Hire is here to make sure every student gets their shot.
        </p>
      </div>
    </div>
  );
}
