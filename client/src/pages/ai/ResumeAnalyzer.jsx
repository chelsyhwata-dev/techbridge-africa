import { useState } from 'react';
import { ClipboardCheck, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function ResumeAnalyzer() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeStored = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/resume-analysis', {});
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const analyzeText = async () => {
    if (!text.trim()) return toast.error('Paste your resume text first');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/resume-analysis', { text });
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
        <ClipboardCheck className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">AI Resume Analyzer</h1>
      </div>
      <p className="text-navy-400 mb-6">Get a Resume Score, an ATS Score, and specific fixes — including rewritten weak bullet points.</p>

      <div className="card mb-6 space-y-3">
        <Button type="button" onClick={analyzeStored} disabled={loading} className="w-full">{loading ? 'Analyzing...' : 'Analyze My Uploaded CV'}</Button>
        <p className="text-center text-xs text-gray-400">or paste your resume text below</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="input-field h-40 resize-none" placeholder="Paste your resume text here..." />
        <Button type="button" onClick={analyzeText} disabled={loading} variant="secondary" className="w-full">{loading ? 'Analyzing...' : 'Analyze Pasted Text'}</Button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="card flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-navy-900">{result.resumeScore}</p>
              <p className="text-xs text-gray-500">Resume Score</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-navy-900">{result.atsScore}</p>
              <p className="text-xs text-gray-500">ATS Score</p>
            </div>
            <p className="text-sm font-medium text-navy-800">{result.verdict}</p>
          </div>

          {result.strengths.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-emerald-700 mb-2">Strengths</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {result.feedback.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-2">Fix These</h3>
              <div className="space-y-3">
                {result.feedback.map((f, i) => (
                  <div key={i} className="bg-amber-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-amber-900">{f.area}</p>
                    <p className="text-sm text-amber-800 mt-0.5">{f.issue}</p>
                    {f.example && <p className="text-xs text-amber-700 mt-1 italic">{f.example}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.rewrites.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-navy-900 mb-2 flex items-center gap-2"><Sparkles size={16} className="text-gold-500" /> Suggested Rewrites</h3>
              <div className="space-y-3">
                {result.rewrites.map((r, i) => (
                  <div key={i} className="text-sm">
                    <p className="text-gray-500">Before: <span className="italic">"{r.original}"</span></p>
                    <p className="text-emerald-700 mt-1">After: {r.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
