import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function InterviewSimulator() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/ai/interview/questions').then((res) => {
      setQuestions(res.data);
      if (res.data.length) setCurrent(res.data[Math.floor(Math.random() * res.data.length)]);
    }).catch(() => {});
  }, []);

  const nextQuestion = () => {
    setResult(null);
    setAnswer('');
    setCurrent(questions[Math.floor(Math.random() * questions.length)]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return toast.error('Write an answer first');
    setLoading(true);
    try {
      const res = await api.post('/ai/interview/answer', { questionId: current.id, answer });
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Scoring failed');
    } finally {
      setLoading(false);
    }
  };

  if (!current) return <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-2">
        <MessageCircle className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">AI Interview Simulator</h1>
      </div>
      <p className="text-navy-400 mb-6">Practice real interview questions and get scored, structured feedback.</p>

      <div className="card mb-4">
        <span className="badge-blue mb-2 inline-block">{current.category}</span>
        <p className="font-semibold text-navy-900">{current.question}</p>
      </div>

      {!result ? (
        <form onSubmit={submit} className="card space-y-3">
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="input-field h-32 resize-none" placeholder="Type your answer..." />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Scoring...' : 'Submit Answer'}</Button>
            <Button type="button" variant="secondary" onClick={nextQuestion}>Skip</Button>
          </div>
        </form>
      ) : (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-extrabold text-navy-900">{result.score}</span>
            <span className="text-gray-500">/ 100</span>
          </div>
          <div>
            {result.feedback.map((f, i) => <p key={i} className="text-sm text-navy-700 mb-1">{f}</p>)}
          </div>
          <div className="bg-navy-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Model answer:</p>
            <p className="text-sm text-navy-800">{result.modelAnswer}</p>
          </div>
          <Button type="button" onClick={nextQuestion} className="w-full">Next Question</Button>
        </div>
      )}
    </div>
  );
}
