import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function CareerCoach() {
  const [goal, setGoal] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    const question = goal;
    setGoal('');
    setLoading(true);
    try {
      const res = await api.post('/ai/career-coach', { goal: question });
      setHistory((h) => [...h, { question, answer: res.data }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reach the coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-2">
        <MessageSquare className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">AI Career Coach</h1>
      </div>
      <p className="text-navy-400 mb-6">Tell me what role you're aiming for — I'll compare it against your profile.</p>

      <div className="space-y-4 mb-6">
        {history.length === 0 && (
          <div className="card text-sm text-gray-500">
            Try: "I want to become a backend developer" or "I want to work in cybersecurity"
          </div>
        )}
        {history.map((h, i) => (
          <div key={i} className="space-y-2">
            <div className="bg-navy-900 text-white rounded-2xl rounded-br-sm px-4 py-2.5 ml-auto max-w-md text-sm">{h.question}</div>
            <div className="card">
              <p className="text-sm text-navy-800 mb-3">{h.answer.message}</p>
              {h.answer.matchedPath && (
                <>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2">
                    {h.answer.roadmap.map((step, j) => (
                      <span key={step} className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 ${j === h.answer.roadmap.length - 1 ? 'bg-gold-500 text-navy-900' : 'bg-navy-50 text-navy-800'}`}>{step}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Recommended projects: {h.answer.recommendedProjects.join('; ')}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={ask} className="flex gap-2">
        <input value={goal} onChange={(e) => setGoal(e.target.value)} className="input-field flex-1" placeholder="I want to become a..." />
        <Button type="submit" disabled={loading}>{loading ? '...' : 'Ask'}</Button>
      </form>
    </div>
  );
}
