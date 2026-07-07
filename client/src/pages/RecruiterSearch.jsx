import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Github, Award, MapPin } from 'lucide-react';
import api from '../api/axios';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function RecruiterSearch() {
  const [filters, setFilters] = useState({ skill: '', location: '', degree: '', hasGithub: false });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (filters.skill) params.skill = filters.skill;
      if (filters.location) params.location = filters.location;
      if (filters.degree) params.degree = filters.degree;
      if (filters.hasGithub) params.hasGithub = 'true';
      const res = await api.get('/recruiter/candidates', { params });
      setCandidates(res.data.candidates);
    } catch {
      // no-op
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => { search(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Search className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">Candidate Search</h1>
      </div>
      <p className="text-navy-400 mb-6">Filter the student pool by skill, location, degree, and GitHub activity.</p>

      <form onSubmit={search} className="card mb-6 grid sm:grid-cols-4 gap-3">
        <Input placeholder="Skill (e.g. React)" value={filters.skill} onChange={(e) => setFilters({ ...filters, skill: e.target.value })} />
        <Input placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        <Input placeholder="Degree" value={filters.degree} onChange={(e) => setFilters({ ...filters, degree: e.target.value })} />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={filters.hasGithub} onChange={(e) => setFilters({ ...filters, hasGithub: e.target.checked })} /> Has GitHub
          </label>
          <Button type="submit" disabled={loading} className="flex-1">Search</Button>
        </div>
      </form>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}</div>
      ) : candidates.length === 0 && searched ? (
        <p className="text-center text-gray-400 py-12">No candidates match those filters.</p>
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => {
            let skills = c.skills;
            if (typeof skills === 'string') skills = JSON.parse(skills || '[]');
            return (
              <div key={c.id} className="card flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  {c.profile_image ? (
                    <img src={c.profile_image} className="w-14 h-14 rounded-full object-cover" alt={c.name} />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-navy-100 flex items-center justify-center font-bold text-navy-700">{c.name?.[0]}</div>
                  )}
                  <div>
                    <p className="font-semibold text-navy-900">{c.name}</p>
                    <p className="text-sm text-gold-600">{c.headline || c.career_path || c.degree}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      {c.location && <span className="flex items-center gap-1"><MapPin size={12} /> {c.location}</span>}
                      {c.github_username && <span className="flex items-center gap-1"><Github size={12} /> {c.github_username}</span>}
                      {c.verified_skill_count > 0 && <span className="flex items-center gap-1 text-emerald-600"><Award size={12} /> {c.verified_skill_count} verified</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(skills || []).slice(0, 6).map((s) => <span key={s} className="bg-navy-50 text-navy-800 px-2 py-0.5 rounded text-xs">{s}</span>)}
                    </div>
                  </div>
                </div>
                {c.portfolio_slug && <Link to={`/u/${c.portfolio_slug}`} target="_blank" className="text-sm text-gold-600 hover:underline flex-shrink-0">View Portfolio</Link>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
