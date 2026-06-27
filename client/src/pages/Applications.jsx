import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Building2 } from 'lucide-react';
import api from '../api/axios';
import { formatDate, getStatusColor } from '../utils/helpers';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/my-applications')
      .then((res) => setApplications(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-6" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>

      {applications.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No applications yet</p>
          <Link to="/jobs" className="text-gold-600 hover:underline mt-2 inline-block">Browse jobs &rarr;</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {app.logo_path ? (
                  <img src={app.logo_path} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="text-gold-600" size={18} />
                  </div>
                )}
                <div className="min-w-0">
                  <Link to={`/jobs/${app.job_id}`} className="font-medium hover:text-gold-600 line-clamp-1">{app.title}</Link>
                  <p className="text-sm text-gray-500">{app.company_name} &bull; {app.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className={getStatusColor(app.status)}>{app.status}</span>
                <span className="text-xs text-gray-400">{formatDate(app.applied_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
