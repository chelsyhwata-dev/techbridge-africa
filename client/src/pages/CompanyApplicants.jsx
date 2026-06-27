import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, User } from 'lucide-react';
import api from '../api/axios';
import { formatDate, getStatusColor, parseSkills } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function CompanyApplicants() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/applications/job/${jobId}`)
      .then((res) => setApplicants(res.data))
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => setLoading(false));
  }, [jobId]);

  const updateStatus = async (appId, status) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      setApplicants((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
      toast.success(`Application ${status}`);
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Applicants ({applicants.length})</h1>

      {applicants.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No applicants yet</div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => {
            const skills = parseSkills(app.skills);
            return (
              <div key={app.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {app.profile_image ? (
                      <img src={app.profile_image} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center"><User className="text-gold-600" size={20} /></div>
                    )}
                    <div>
                      <h3 className="font-semibold">{app.name}</h3>
                      <p className="text-sm text-gray-500">{app.university} &bull; {app.year_of_study} &bull; {app.location}</p>
                      {app.bio && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{app.bio}</p>}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {skills.map((s) => <span key={s} className="text-xs bg-navy-50 text-navy-800 px-2 py-0.5 rounded">{s}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={getStatusColor(app.status)}>{app.status}</span>
                    {app.cv_path && (
                      <a href={app.cv_path} target="_blank" rel="noopener noreferrer" className="text-sm text-gold-600 hover:underline flex items-center gap-1">
                        <Download size={14} /> CV
                      </a>
                    )}
                  </div>
                </div>
                {app.cover_letter && <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">{app.cover_letter}</div>}
                <div className="flex gap-2 mt-4 pt-3 border-t">
                  {['shortlisted', 'accepted', 'rejected'].map((status) => (
                    <button key={status} onClick={() => updateStatus(app.id, status)}
                      className={`text-sm px-3 py-1 rounded-lg font-medium transition-colors ${
                        app.status === status ? 'opacity-50 cursor-not-allowed' :
                        status === 'accepted' ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                        status === 'rejected' ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                        'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`} disabled={app.status === status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
