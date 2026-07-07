import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Target, Award, TrendingUp, Briefcase, Code2, Route,
  MessageSquare, ClipboardCheck, CircleUserRound, BarChart3, Gift, DollarSign,
} from 'lucide-react';
import api from '../api/axios';

const TOOLS = [
  { to: '/ai-matches', icon: Sparkles, label: 'AI Job Matches', desc: 'See jobs ranked by fit' },
  { to: '/student/skills', icon: Code2, label: 'Skills Profile', desc: 'Add & verify skills' },
  { to: '/student/portfolio', icon: CircleUserRound, label: 'Portfolio Builder', desc: 'Showcase your projects' },
  { to: '/student/roadmap', icon: Route, label: 'Career Roadmap', desc: 'Plan your path' },
  { to: '/ai/resume-analyzer', icon: ClipboardCheck, label: 'Resume Analyzer', desc: 'Score & improve your CV' },
  { to: '/ai/career-coach', icon: MessageSquare, label: 'Career Coach', desc: 'Ask about any role' },
  { to: '/ai/skill-gap', icon: Target, label: 'Skill Gap Analysis', desc: 'See what you\'re missing' },
  { to: '/ai/interview-simulator', icon: Target, label: 'Interview Simulator', desc: 'Practice real questions' },
  { to: '/ai/salary-predictor', icon: DollarSign, label: 'Salary Predictor', desc: 'Estimate your market rate' },
  { to: '/assessments', icon: Award, label: 'Coding Assessments', desc: 'Earn Verified Skill badges' },
  { to: '/student/analytics', icon: BarChart3, label: 'My Analytics', desc: 'Views, applications & more' },
  { to: '/student/rewards', icon: Gift, label: 'Badges & Referrals', desc: 'Track achievements' },
];

export default function StudentDashboard() {
  const [readiness, setReadiness] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/students/readiness').then((r) => setReadiness(r.data)).catch(() => {}),
      api.get('/students/completion').then((r) => setCompletion(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-navy-900 mb-1">Your Career Dashboard</h1>
      <p className="text-navy-400 mb-8">Everything you need to go from student to hired.</p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-navy-900 flex items-center gap-2"><TrendingUp size={18} className="text-gold-500" /> Internship Readiness</h2>
            <Link to="/student/readiness" className="text-sm text-gold-600 hover:underline">Details</Link>
          </div>
          {loading ? (
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
          ) : readiness ? (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-navy-900">{readiness.overall}%</span>
                <span className="text-sm text-gray-500">ready</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-navy-800 to-gold-500 rounded-full" style={{ width: `${readiness.overall}%` }} />
              </div>
              {readiness.recommendations[0] && (
                <p className="text-sm text-gray-600">Top tip: {readiness.recommendations[0].action} <span className="text-gold-600 font-medium">{readiness.recommendations[0].gain}</span></p>
              )}
            </>
          ) : <p className="text-sm text-gray-400">Complete your profile to see this score.</p>}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-navy-900 flex items-center gap-2"><Target size={18} className="text-gold-500" /> Profile Completion</h2>
            <Link to="/student/profile" className="text-sm text-gold-600 hover:underline">Edit profile</Link>
          </div>
          {loading ? (
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
          ) : completion ? (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-navy-900">{completion.score}%</span>
                <span className="text-sm text-gray-500">complete</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completion.score}%` }} />
              </div>
              {completion.nextSteps[0] && (
                <p className="text-sm text-gray-600">Next: {completion.nextSteps[0].label} <span className="text-emerald-600 font-medium">+{completion.nextSteps[0].gain}%</span></p>
              )}
            </>
          ) : <p className="text-sm text-gray-400">Loading...</p>}
        </div>
      </div>

      <h2 className="font-semibold text-navy-900 mb-4 flex items-center gap-2"><Briefcase size={18} className="text-gold-500" /> Career Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TOOLS.map((tool) => (
          <Link key={tool.to} to={tool.to} className="card hover:border-gold-300 group">
            <tool.icon size={22} className="text-navy-700 group-hover:text-gold-500 mb-3 transition-colors" />
            <p className="font-semibold text-navy-900 text-sm">{tool.label}</p>
            <p className="text-xs text-gray-500 mt-1">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
