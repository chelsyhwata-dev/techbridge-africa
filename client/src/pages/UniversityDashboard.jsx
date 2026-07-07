import { useState, useEffect } from 'react';
import { GraduationCap, CheckCircle2, Building2, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function UniversityDashboard() {
  const [tab, setTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [placementStats, setPlacementStats] = useState(null);
  const [partnerships, setPartnerships] = useState([]);
  const [gradAnalytics, setGradAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAll = () => {
    Promise.all([
      api.get('/university/students').then((r) => setStudents(r.data)),
      api.get('/university/placement-stats').then((r) => setPlacementStats(r.data)),
      api.get('/university/employer-partnerships').then((r) => setPartnerships(r.data)),
      api.get('/university/graduate-analytics').then((r) => setGradAnalytics(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const verifyStudent = async (studentId) => {
    try {
      await api.patch(`/university/students/${studentId}/verify`);
      toast.success('Student verified');
      loadAll();
    } catch {
      toast.error('Failed to verify');
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">University Portal</h1>
      </div>

      {placementStats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center"><p className="text-3xl font-extrabold text-navy-900">{placementStats.verifiedStudentCount}</p><p className="text-xs text-gray-500 mt-1">Verified Students</p></div>
          <div className="card text-center"><p className="text-3xl font-extrabold text-navy-900">{placementStats.placedStudentCount}</p><p className="text-xs text-gray-500 mt-1">Placed Students</p></div>
          <div className="card text-center"><p className="text-3xl font-extrabold text-navy-900">{placementStats.internshipPlacements}</p><p className="text-xs text-gray-500 mt-1">Internship Placements</p></div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {['students', 'partnerships', 'analytics'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{t}</button>
        ))}
      </div>

      {tab === 'students' && (
        <div className="space-y-2">
          {students.map((s) => (
            <div key={s.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-navy-900">{s.name}</p>
                <p className="text-xs text-gray-500">{s.email} · {s.degree} · {s.year_of_study}</p>
              </div>
              {s.university_verified ? (
                <span className="badge-green flex items-center gap-1"><CheckCircle2 size={12} /> Verified</span>
              ) : (
                <Button onClick={() => verifyStudent(s.id)} variant="secondary" className="text-sm py-1.5 px-3">Verify</Button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'partnerships' && (
        <div className="space-y-2">
          {partnerships.map((p) => (
            <div key={p.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-navy-400" />
                <p className="font-medium text-navy-900">{p.company_name}</p>
                <span className="text-xs text-gray-400">{p.industry}</span>
              </div>
              <span className="badge-blue">{p.application_count} applications</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'analytics' && gradAnalytics && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={18} className="text-gold-500" /><h2 className="font-semibold text-navy-900">Graduate Employment</h2></div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div><p className="text-3xl font-extrabold text-navy-900">{gradAnalytics.employmentRate}%</p><p className="text-xs text-gray-500 mt-1">Employment Rate</p></div>
            <div><p className="text-3xl font-extrabold text-navy-900">{gradAnalytics.avgDaysToFirstOffer ?? '—'}</p><p className="text-xs text-gray-500 mt-1">Avg Days to First Offer</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
