import { Link } from 'react-router-dom';
import { MapPin, Clock, Building2 } from 'lucide-react';
import { formatDate, parseSkills, getJobTypeBadge, formatJobType } from '../../utils/helpers';
import MatchBadge from '../common/MatchBadge';

export default function JobCard({ job }) {
  const skills = parseSkills(job.required_skills);

  return (
    <div className={`card group ${job.is_premium ? 'border-gold-300 bg-gold-50/30' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {job.logo_path ? (
            <img src={job.logo_path} alt={job.company_name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="text-gold-600" size={20} />
            </div>
          )}
          <div className="min-w-0">
            <Link to={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-gold-600 transition-colors line-clamp-1">
              {job.title}
            </Link>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <Building2 size={14} /> {job.company_name}
              {job.verified && <span className="text-navy-600 text-xs">&bull; Verified</span>}
            </p>
          </div>
        </div>
        {job.matchScore !== undefined && <MatchBadge score={job.matchScore} />}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <span className={getJobTypeBadge(job.type)}>{formatJobType(job.type)}</span>
        {job.location && (
          <span className="badge-gray flex items-center gap-1"><MapPin size={12} />{job.location}</span>
        )}
        {job.is_premium && <span className="badge-gold">Premium</span>}
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skills.slice(0, 5).map((skill) => (
            <span key={skill} className="text-xs bg-navy-50 text-navy-800 px-2 py-1 rounded-md font-medium">
              {skill}
            </span>
          ))}
          {skills.length > 5 && <span className="text-xs text-gray-400">+{skills.length - 5} more</span>}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} />{formatDate(job.created_at)}</span>
        <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-gold-600 hover:text-navy-800">
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
