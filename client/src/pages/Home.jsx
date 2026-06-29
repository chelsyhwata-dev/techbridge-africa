import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Building2, Target, Globe, Shield, Zap, GraduationCap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const ctaLink = user
    ? (user.role === 'admin' ? '/admin' : user.role === 'company' ? '/company/dashboard' : '/ai-matches')
    : '/register';
  const ctaLabel = user ? 'Go to Dashboard' : 'Get Started';

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-navy-600/30 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6 border border-white/10">
              <Sparkles size={16} className="text-gold-400" />
              <span className="text-navy-100">AI-Powered Job Matching for African Tech Talent</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Your Bridge to{' '}
              <span className="text-gold-500">Tech Careers</span>{' '}
              in Africa
            </h1>
            <p className="text-lg md:text-xl text-navy-200 mt-6 max-w-2xl">
              NexGen Hire connects students and graduates with internships, learnerships, and graduate programmes using AI-powered skill matching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to={ctaLink} className="btn-gold text-lg px-8 py-3.5 flex items-center justify-center gap-2">
                {ctaLabel} <ArrowRight size={20} />
              </Link>
              <Link to="/jobs" className="bg-white/10 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all text-lg text-center border border-white/15">
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
        {/* Gold accent line */}
        <div className="h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Tech Students', value: '10,000+', icon: Users, color: 'bg-navy-50 text-navy-700' },
              { label: 'Companies', value: '500+', icon: Building2, color: 'bg-gold-50 text-gold-700' },
              { label: 'Jobs Posted', value: '2,500+', icon: Target, color: 'bg-emerald-50 text-emerald-700' },
              { label: 'African Countries', value: '15+', icon: Globe, color: 'bg-navy-50 text-navy-700' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon size={24} />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-navy-900">{stat.value}</p>
                <p className="text-sm text-navy-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900">How It Works</h2>
          <p className="text-navy-400 mt-2">Three steps to your dream tech career</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Create Your Profile', desc: 'Sign up as a student or graduate, add your skills, university, and upload your CV.', bg: 'bg-navy-900' },
            { step: '2', title: 'Get AI-Matched', desc: 'Our engine compares your skills to job requirements and ranks opportunities by fit percentage.', bg: 'bg-gold-500' },
            { step: '3', title: 'Apply & Get Hired', desc: 'Apply directly to matched jobs, track your application status, and land your dream tech role.', bg: 'bg-navy-700' },
          ].map((item) => (
            <div key={item.step} className="text-center group">
              <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-navy-900 mb-2">{item.title}</h3>
              <p className="text-navy-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For graduates */}
      <section className="bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-gold-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <GraduationCap size={32} className="text-gold-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Just Graduated? We've Got You Covered</h3>
              <p className="text-navy-200">Set your status to "Recent Graduate" and get matched with graduate programmes, entry-level roles, and learnerships tailored to your skills.</p>
            </div>
            <Link to="/register" className="btn-gold whitespace-nowrap">Join as Graduate</Link>
          </div>
        </div>
      </section>

      {/* For companies */}
      <section className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">For Companies & Startups</h2>
              <p className="text-navy-200 mb-8">
                Access Africa's top tech talent pipeline. Post internships, graduate programmes, and learnerships, then review AI-matched candidates.
              </p>
              <ul className="space-y-3">
                {[
                  { text: 'Post internships, grad programmes & learnerships', icon: Zap },
                  { text: 'AI-matched candidate recommendations', icon: Sparkles },
                  { text: 'Review applications & shortlist', icon: Users },
                  { text: 'Verified company profiles', icon: Shield },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon size={16} className="text-gold-400" />
                    </div>
                    <span className="text-navy-100">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn-gold mt-8 inline-flex items-center gap-2">
                Start Hiring <ArrowRight size={18} />
              </Link>
            </div>
            <div className="bg-navy-800 rounded-2xl p-8 border border-navy-700">
              <div className="space-y-4">
                <div className="h-4 bg-navy-700 rounded-full w-3/4" />
                <div className="h-4 bg-navy-700 rounded-full w-1/2" />
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[{ score: 92, color: 'text-gold-400' }, { score: 78, color: 'text-gold-300' }, { score: 65, color: 'text-navy-200' }].map(({ score, color }) => (
                    <div key={score} className="bg-navy-700/50 rounded-xl p-4 text-center border border-navy-600">
                      <div className={`text-2xl font-bold ${color}`}>{score}%</div>
                      <div className="text-xs text-navy-400 mt-1">Match</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">Ready to Bridge the Gap?</h2>
        <p className="text-navy-400 mb-8 max-w-xl mx-auto">Join thousands of African tech students, graduates, and companies already using NexGen Hire.</p>
        <Link to="/register" className="btn-gold text-lg px-8 py-3.5 inline-flex items-center gap-2">
          Create Free Account <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
}
