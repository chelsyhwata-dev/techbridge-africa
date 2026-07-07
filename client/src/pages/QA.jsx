import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HelpCircle, MessageSquare, Calendar } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export function QAList() {
  const [questions, setQuestions] = useState([]);
  const [showAsk, setShowAsk] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/qa').then((res) => setQuestions(res.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const ask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    try {
      await api.post('/qa', { title, body });
      toast.success('Question posted');
      setTitle(''); setBody(''); setShowAsk(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="text-gold-500" size={28} />
          <h1 className="text-3xl font-bold text-navy-900">Community Q&A</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/community/events" className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"><Calendar size={16} /> Events</Link>
          <Button onClick={() => setShowAsk(!showAsk)}>{showAsk ? 'Cancel' : 'Ask a Question'}</Button>
        </div>
      </div>

      {showAsk && (
        <form onSubmit={ask} className="card mb-6 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Question title" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} className="input-field h-24 resize-none" placeholder="Add more detail (optional)" />
          <Button type="submit" className="w-full">Post Question</Button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Link key={q.id} to={`/community/qa/${q.id}`} className="card block hover:border-gold-300">
              <p className="font-semibold text-navy-900">{q.title}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span>by {q.author_name}</span>
                <span className="flex items-center gap-1"><MessageSquare size={12} /> {q.answer_count} answers</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function QADetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');

  const load = () => api.get(`/qa/${id}`).then((res) => setQuestion(res.data)).catch(() => {});
  useEffect(() => { load(); }, [id]);

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    try {
      await api.post(`/qa/${id}/answers`, { body: answer });
      setAnswer('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to answer');
    }
  };

  if (!question) return <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card mb-6">
        <p className="text-xl font-bold text-navy-900">{question.title}</p>
        {question.body && <p className="text-navy-700 mt-2">{question.body}</p>}
        <p className="text-xs text-gray-400 mt-3">by {question.author_name} ({question.author_role})</p>
      </div>

      <h2 className="font-semibold text-navy-900 mb-3">{question.answers.length} Answers</h2>
      <div className="space-y-3 mb-6">
        {question.answers.map((a) => (
          <div key={a.id} className="card">
            <p className="text-sm text-navy-800">{a.body}</p>
            <p className="text-xs text-gray-400 mt-2">{a.author_name} ({a.author_role})</p>
          </div>
        ))}
      </div>

      <form onSubmit={submitAnswer} className="card space-y-3">
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="input-field h-24 resize-none" placeholder="Write an answer..." />
        <Button type="submit" className="w-full">Post Answer</Button>
      </form>
    </div>
  );
}
