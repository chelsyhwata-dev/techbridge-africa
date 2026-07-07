import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function SkillGapAnalysis() {
  const [paths, setPaths] = useState([]);
  const [targetPath, setTargetPath] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/career/paths').then((res) => { setPaths(res.data); if (res.data.length) setTargetPath(res.data[0]); }).catch(() => {});
  }, []);

  const analyze = async () => {
    if (!targetPath) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/skill-gap', { targetPath });
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Target className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">AI Skill Gap Analysis</h1>
      </div>
      <p className="text-navy-400 mb-6">See exactly what's missing between your skills and a target role.</p>

      <div className="card mb-6 flex gap-2">
        <select value={targetPath} onChange={(e) => setTargetPath(e.target.value)} className="input-field flex-1">
          {paths.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <Button type="button" onClick={analyze} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze'}</Button>
      </div>

      {result && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-emerald-700 mb-3">Skills You Have</h3>
            {result.have.length === 0 ? <p className="text-sm text-gray-400">None yet</p> : (
              <div className="flex flex-wrap gap-2">{result.have.map((s) => <span key={s} className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg text-sm font-medium">{s}</span>)}</div>
            )}
          </div>
          <div className="card">
            <h3 className="font-semibold text-red-700 mb-3">Skills Missing</h3>
            {result.missing.length === 0 ? <p className="text-sm text-gray-400">You have everything!</p> : (
              <div className="flex flex-wrap gap-2">{result.missing.map((s) => <span key={s} className="bg-red-50 text-red-700 px-2.5 py-1 rounded-lg text-sm font-medium">{s}</span>)}</div>
            )}
          </div>
          <div className="card md:col-span-2">
            <h3 className="font-semibold text-navy-900 mb-2">Suggested Courses</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside mb-3">{result.suggestedCourses.map((c) => <li key={c}>{c}</li>)}</ul>
            <h3 className="font-semibold text-navy-900 mb-2">Suggested Project</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside">{result.suggestedProjects.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
}
