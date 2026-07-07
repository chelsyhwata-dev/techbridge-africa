import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Github, Linkedin, MapPin, GraduationCap, Award } from 'lucide-react';
import api from '../api/axios';

export default function PublicPortfolio() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/students/portfolio/${slug}`)
      .then((res) => setData(res.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-gray-500">Portfolio not found.</div>;
  if (!data) return <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse"><div className="h-40 bg-gray-200 rounded-2xl" /></div>;

  let skills = data.skills;
  if (typeof skills === 'string') skills = JSON.parse(skills || '[]');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-4">
          {data.profile_image ? (
            <img src={data.profile_image} alt={data.name} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-navy-100 flex items-center justify-center text-2xl font-bold text-navy-700">{data.name?.[0]}</div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-navy-900">{data.name}</h1>
            <p className="text-gold-600 font-medium">{data.headline || data.career_path}</p>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              {data.university && <span className="flex items-center gap-1"><GraduationCap size={14} /> {data.university}</span>}
              {data.location && <span className="flex items-center gap-1"><MapPin size={14} /> {data.location}</span>}
            </div>
          </div>
        </div>
        {data.bio && <p className="text-navy-700">{data.bio}</p>}
        <div className="flex gap-3 mt-4">
          {data.github_url && <a href={data.github_url} target="_blank" rel="noreferrer" className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"><Github size={16} /> GitHub</a>}
          {data.linkedin_url && <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"><Linkedin size={16} /> LinkedIn</a>}
        </div>
      </div>

      {skills?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-navy-900 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => {
              const verified = data.verifiedSkills?.includes(s);
              return (
                <span key={s} className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${verified ? 'bg-emerald-50 text-emerald-800' : 'bg-navy-50 text-navy-800'}`}>
                  {verified && <Award size={14} />} {s}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {data.projects?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-navy-900 mb-3">Projects</h2>
          <div className="space-y-4">
            {data.projects.map((p) => (
              <div key={p.id} className="border-b border-gray-100 pb-4 last:border-none last:pb-0">
                <p className="font-semibold text-navy-900">{p.title}</p>
                {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                {p.tech_stack && <p className="text-xs text-gray-400 mt-1">{p.tech_stack}</p>}
                <div className="flex gap-3 mt-2">
                  {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="text-xs text-gold-600 hover:underline">Repo</a>}
                  {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" className="text-xs text-gold-600 hover:underline">Demo</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
