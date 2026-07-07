import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ExternalLink, HelpCircle } from 'lucide-react';
import api from '../api/axios';

const TYPE_LABELS = { career_fair: 'Career Fair', hackathon: 'Hackathon', meetup: 'Meetup', workshop: 'Workshop' };
const TYPE_COLORS = { career_fair: 'badge-blue', hackathon: 'badge-gold', meetup: 'badge-green', workshop: 'badge-gray' };

export default function Events() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/events', { params: filter ? { type: filter } : {} })
      .then((res) => setEvents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Calendar className="text-gold-500" size={28} />
          <h1 className="text-3xl font-bold text-navy-900">Events & Hackathons</h1>
        </div>
        <Link to="/community/qa" className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"><HelpCircle size={16} /> Q&A</Link>
      </div>
      <p className="text-navy-400 mb-6">Career fairs, hackathons, and meetups relevant to tech students.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {['', 'career_fair', 'hackathon', 'meetup', 'workshop'].map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === t ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t ? TYPE_LABELS[t] : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}</div>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No upcoming events.</p>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`${TYPE_COLORS[e.type]} mb-2 inline-block`}>{TYPE_LABELS[e.type]}</span>
                  <p className="font-semibold text-navy-900">{e.title}</p>
                  {e.description && <p className="text-sm text-gray-500 mt-1">{e.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(e.event_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {e.is_virtual ? 'Virtual' : e.location}</span>
                  </div>
                </div>
                {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="btn-secondary text-sm py-2 px-3 flex items-center gap-1 flex-shrink-0">Register <ExternalLink size={14} /></a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
