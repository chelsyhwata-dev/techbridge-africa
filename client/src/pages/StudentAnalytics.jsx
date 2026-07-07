import { useState, useEffect } from 'react';
import { BarChart3, Eye, Users, Send, CalendarCheck } from 'lucide-react';
import api from '../api/axios';

const STATUS_LABELS = {
  pending: 'Pending', reviewed: 'Reviewed', shortlisted: 'Shortlisted',
  interview: 'Interview', offer: 'Offer', rejected: 'Rejected', accepted: 'Accepted', hired: 'Hired',
};

export default function StudentAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/students/analytics').then((res) => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-6" /></div>;

  const cards = [
    { icon: Eye, label: 'Profile Views', value: data.profileViews },
    { icon: Users, label: 'Recruiter Views', value: data.recruiterViews },
    { icon: Send, label: 'Applications Sent', value: data.applicationsSent },
    { icon: CalendarCheck, label: 'Interview Invites', value: data.interviewInvites },
  ];

  const maxCount = Math.max(1, ...data.statusBreakdown.map((s) => s.count));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">Your Analytics</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="card text-center">
            <c.icon className="mx-auto text-gold-500 mb-2" size={22} />
            <p className="text-2xl font-extrabold text-navy-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-navy-900 mb-4">Application Status Breakdown</h2>
        {data.statusBreakdown.length === 0 ? (
          <p className="text-sm text-gray-400">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {data.statusBreakdown.map((s) => (
              <div key={s.status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-navy-800 font-medium">{STATUS_LABELS[s.status] || s.status}</span>
                  <span className="text-gray-500">{s.count}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-500 rounded-full" style={{ width: `${(s.count / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
