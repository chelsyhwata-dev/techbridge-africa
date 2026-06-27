import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Building2, ExternalLink, Briefcase } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { formatDate, parseSkills, getJobTypeBadge, formatJobType } from '../utils/helpers';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then((res) => setJob(res.data)).catch(() => toast.error('Job not found')).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post('/applications', { jobId: Number(id), coverLetter });
      setApplied(true);
      toast.success('Application submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/2 mb-4" /><div className="h-4 bg-gray-200 rounded w-1/3" /></div>;
  if (!job) return <div className="text-center py-20 text-gray-500">Job not found</div>;

  const skills = parseSkills(job.required_skills);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <div className="flex items-start gap-4">
          {job.logo_path ? (
            <img src={job.logo_path} alt={job.company_name} className="w-16 h-16 rounded-xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-navy-100 flex items-center justify-center">
              <Building2 className="text-gold-600" size={28} />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              <Building2 size={16} /> {job.company_name}
              {job.verified && <span className="badge-green text-xs">Verified</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <span className={`${getJobTypeBadge(job.type)} flex items-center gap-1`}><Briefcase size={14} />{formatJobType(job.type)}</span>
          {job.location && <span className="badge-gray flex items-center gap-1"><MapPin size={14} />{job.location}</span>}
          {job.salary_range && <span className="badge-gold">{job.salary_range}</span>}
          <span className="badge-gray flex items-center gap-1"><Clock size={14} />Posted {formatDate(job.created_at)}</span>
        </div>

        {job.application_deadline && (
          <p className="text-sm text-red-600 mt-3 font-medium">Deadline: {formatDate(job.application_deadline)}</p>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">{job.description}</div>
        </div>

        {skills.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="bg-navy-50 text-navy-800 px-3 py-1.5 rounded-lg text-sm font-medium">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {job.website && (
          <a href={job.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold-600 hover:underline mt-4">
            Company website <ExternalLink size={14} />
          </a>
        )}

        {user?.role === 'student' && job.status === 'open' && (
          <div className="mt-8 pt-6 border-t">
            {applied ? (
              <div className="badge-green text-base px-4 py-2">Application submitted!</div>
            ) : (
              <div className="space-y-4">
                <textarea
                  placeholder="Cover letter (optional)"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="input-field h-32 resize-none"
                />
                <Button onClick={handleApply} disabled={applying}>
                  {applying ? 'Submitting...' : 'Apply Now'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
