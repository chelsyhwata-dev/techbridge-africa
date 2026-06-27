import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import JobCard from '../components/jobs/JobCard';

export default function AIMatches() {
  const [data, setData] = useState({ matches: [], studentSkills: [], totalMatches: 0, studentStatus: 'Current Student' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/students/matches')
      .then((res) => {
        setData(res.data);
        if (res.data.message) setMessage(res.data.message);
      })
      .catch(() => setMessage('Failed to load matches'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8"><Sparkles className="text-gold-500" /><h1 className="text-3xl font-bold">Finding your matches...</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-48" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold">AI-Matched Jobs</h1>
      </div>
      <p className="text-gray-500 mb-6">Jobs ranked by how well they match your skill set</p>

      {data.studentSkills.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="badge-blue">{data.studentStatus}</span>
            <p className="text-sm text-gray-500">
              {data.studentStatus === 'Current Student'
                ? 'Showing internships, part-time roles & learnerships'
                : data.studentStatus === 'Recent Graduate'
                ? 'Showing graduate programmes, entry-level & full-time roles'
                : 'Showing all available opportunities'}
            </p>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-2">Your Skills:</p>
          <div className="flex flex-wrap gap-2">
            {data.studentSkills.map((s) => (
              <span key={s} className="bg-navy-50 text-navy-800 px-3 py-1 rounded-lg text-sm font-medium">{s}</span>
            ))}
          </div>
        </div>
      )}

      {message && (
        <div className="card border-yellow-200 bg-yellow-50 mb-6 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-yellow-800 font-medium">{message}</p>
            <Link to="/student/profile" className="text-gold-600 text-sm hover:underline mt-1 inline-block">
              Update your profile &rarr;
            </Link>
          </div>
        </div>
      )}

      {data.matches.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-4">{data.totalMatches} jobs matched</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.matches.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        </>
      ) : !message && (
        <div className="text-center py-16 text-gray-500">
          <Sparkles size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No matches yet</p>
          <p className="text-sm mt-1">Add more skills to your profile to get matched</p>
        </div>
      )}
    </div>
  );
}
