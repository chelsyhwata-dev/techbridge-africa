import { useState, useEffect } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [outcome, setOutcome] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/assessments').then((r) => setAssessments(r.data)),
      api.get('/assessments/results/mine').then((r) => setResults(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const passedIds = new Set(results.filter((r) => r.passed).map((r) => r.assessment_id));

  const start = async (id) => {
    setOutcome(null);
    setAnswers({});
    try {
      const res = await api.get(`/assessments/${id}`);
      setActive(res.data);
    } catch {
      toast.error('Failed to load assessment');
    }
  };

  const submit = async () => {
    try {
      const answerArray = active.questions.map((_, i) => answers[i] ?? -1);
      const res = await api.post(`/assessments/${active.id}/submit`, { answers: answerArray });
      setOutcome(res.data);
      const r2 = await api.get('/assessments/results/mine');
      setResults(r2.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;

  if (active) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-navy-900 mb-1">{active.title}</h1>
        <p className="text-sm text-gray-500 mb-6">Pass mark: {active.passMark}%</p>

        {!outcome ? (
          <div className="space-y-4">
            {active.questions.map((q) => (
              <div key={q.index} className="card">
                <p className="font-medium text-navy-900 mb-3">{q.index + 1}. {q.q}</p>
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm text-navy-800 cursor-pointer">
                      <input type="radio" name={`q${q.index}`} checked={answers[q.index] === i} onChange={() => setAnswers({ ...answers, [q.index]: i })} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <Button onClick={submit} className="w-full">Submit Assessment</Button>
          </div>
        ) : (
          <div className="card text-center">
            <p className="text-5xl font-extrabold text-navy-900 mb-2">{outcome.score}%</p>
            <p className={outcome.passed ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
              {outcome.passed ? 'Passed! Skill verified.' : 'Not passed — try again anytime.'}
            </p>
            <p className="text-sm text-gray-500 mt-1">{outcome.correct} / {outcome.total} correct</p>
            <Button onClick={() => setActive(null)} className="mt-4">Back to Assessments</Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Award className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">Coding Assessments</h1>
      </div>
      <p className="text-navy-400 mb-6">Pass an assessment to upgrade a skill from self-declared to Verified.</p>

      <div className="space-y-3">
        {assessments.map((a) => (
          <div key={a.id} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold text-navy-900 flex items-center gap-2">
                {a.title} {passedIds.has(a.id) && <CheckCircle2 size={16} className="text-emerald-500" />}
              </p>
              <p className="text-sm text-gray-500">{a.skill_name} · {a.difficulty} · {a.question_count} questions</p>
            </div>
            <Button onClick={() => start(a.id)} variant={passedIds.has(a.id) ? 'secondary' : 'primary'} className="text-sm py-2 px-4">
              {passedIds.has(a.id) ? 'Retake' : 'Start'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
