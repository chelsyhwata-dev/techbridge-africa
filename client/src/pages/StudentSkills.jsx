import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, X, Award } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function StudentSkills() {
  const [taxonomy, setTaxonomy] = useState({});
  const [mySkills, setMySkills] = useState([]);
  const [category, setCategory] = useState('Programming Languages');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([
      api.get('/skills').then((r) => setTaxonomy(r.data)),
      api.get('/skills/mine').then((r) => setMySkills(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const mySkillIds = new Set(mySkills.map((s) => s.skill_id));

  const addSkill = async () => {
    if (!selectedSkill) return;
    try {
      await api.post('/skills/mine', { skillId: Number(selectedSkill), proficiency: 'Beginner' });
      toast.success('Skill added');
      setSelectedSkill('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add skill');
    }
  };

  const removeSkill = async (id) => {
    try {
      await api.delete(`/skills/mine/${id}`);
      load();
    } catch {
      toast.error('Failed to remove skill');
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-6" /></div>;

  const availableInCategory = (taxonomy[category] || []).filter((s) => !mySkillIds.has(s.id));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-navy-900 mb-1">Skills Profile</h1>
      <p className="text-navy-400 mb-6">Add skills from our taxonomy, then earn Verified badges by passing a <Link to="/assessments" className="text-gold-600 hover:underline">coding assessment</Link>.</p>

      <div className="card mb-6">
        <h2 className="font-semibold text-navy-900 mb-3">Add a skill</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.keys(taxonomy).map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === cat ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="input-field flex-1">
            <option value="">Select a skill...</option>
            {availableInCategory.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <Button type="button" onClick={addSkill} variant="secondary">Add</Button>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-navy-900 mb-3">Your skills ({mySkills.length})</h2>
        {mySkills.length === 0 ? (
          <p className="text-sm text-gray-400">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {mySkills.map((s) => (
              <span key={s.id} className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${s.verified ? 'bg-emerald-50 text-emerald-800' : 'bg-navy-50 text-navy-800'}`}>
                {s.verified && <Award size={14} className="text-emerald-600" />}
                {s.name}
                <span className="text-xs opacity-60">({s.proficiency})</span>
                <button onClick={() => removeSkill(s.id)}><X size={14} /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
