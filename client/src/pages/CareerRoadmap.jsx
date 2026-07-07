import { useState, useEffect } from 'react';
import { Route, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '../api/axios';

export default function CareerRoadmap() {
  const [paths, setPaths] = useState([]);
  const [selected, setSelected] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/career/paths').then((res) => {
      setPaths(res.data);
      if (res.data.length) setSelected(res.data[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    api.get(`/career/roadmap/${encodeURIComponent(selected)}`)
      .then((res) => setRoadmap(res.data))
      .catch(() => setRoadmap(null))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Route className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">Career Roadmaps</h1>
      </div>
      <p className="text-navy-400 mb-6">Choose a target path and see exactly what's expected.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {paths.map((p) => (
          <button key={p} onClick={() => setSelected(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selected === p ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card h-64 animate-pulse" />
      ) : roadmap && (
        <div className="card">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 border-b border-gray-100">
            {roadmap.roadmap.map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${i === roadmap.roadmap.length - 1 ? 'bg-gold-500 text-navy-900' : 'bg-navy-50 text-navy-800'}`}>
                  {step}
                </span>
                {i < roadmap.roadmap.length - 1 && <span className="text-gray-300">→</span>}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-navy-900 mb-2 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Core Skills</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {roadmap.skills.map((s) => <span key={s} className="bg-navy-50 text-navy-800 px-2.5 py-1 rounded-lg text-xs font-medium">{s}</span>)}
              </div>

              <h3 className="font-semibold text-navy-900 mb-2">Recommended Projects</h3>
              <ul className="text-sm text-gray-600 space-y-1.5 mb-4 list-disc list-inside">
                {roadmap.projects.map((p) => <li key={p}>{p}</li>)}
              </ul>

              <h3 className="font-semibold text-navy-900 mb-2">Certifications</h3>
              <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                {roadmap.certifications.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-navy-900 mb-2 flex items-center gap-2"><TrendingUp size={16} className="text-gold-500" /> Salary Ranges (ZAR/month)</h3>
              <div className="space-y-2 mb-4">
                {Object.entries(roadmap.salary).map(([level, [low, high]]) => (
                  <div key={level} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span className="capitalize text-navy-800">{level}</span>
                    <span className="font-medium text-navy-900">R{low.toLocaleString()} – R{high.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">Estimated time to readiness: <span className="font-semibold text-navy-900">{roadmap.monthsToReady} months</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
