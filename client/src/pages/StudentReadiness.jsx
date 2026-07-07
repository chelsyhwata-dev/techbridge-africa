import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import api from '../api/axios';

export default function StudentReadiness() {
  const [readiness, setReadiness] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/students/readiness').then((r) => setReadiness(r.data)),
      api.get('/students/completion').then((r) => setCompletion(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-6" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">Internship Readiness Score</h1>
      </div>

      {readiness && (
        <div className="card mb-6">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-6xl font-extrabold text-navy-900">{readiness.overall}%</span>
            <span className="text-gray-500">ready for an internship or graduate role</span>
          </div>

          <div className="space-y-3 mb-6">
            {readiness.components.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-navy-800">{c.name}</span>
                  <span className="text-gray-500">{c.score}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-navy-800 rounded-full" style={{ width: `${c.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-semibold text-navy-900 mb-2">Top recommendations</h3>
          <ul className="space-y-2">
            {readiness.recommendations.map((r, i) => (
              <li key={i} className="flex items-center justify-between bg-navy-50 rounded-lg px-4 py-2.5 text-sm">
                <span className="text-navy-800">{r.action}</span>
                <span className="badge-gold">{r.gain}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {completion && (
        <div className="card">
          <h3 className="font-semibold text-navy-900 mb-4">Profile Completion Checklist</h3>
          <div className="space-y-2">
            {completion.items.map((item) => (
              <div key={item.key} className={`flex items-start gap-3 px-4 py-2.5 rounded-lg ${item.done ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${item.done ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-white'}`}>
                  {item.done ? '✓' : ''}
                </span>
                <div>
                  <p className={`text-sm font-medium ${item.done ? 'text-emerald-800' : 'text-navy-800'}`}>{item.label}</p>
                  <p className="text-xs text-gray-500">{item.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
