import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users, Eye, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { formatDate, getStatusColor } from '../../utils/helpers';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import toast from 'react-hot-toast';

export default function CompanyDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const fetchJobs = () => {
    api.get('/jobs/my-jobs').then((res) => setJobs(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(fetchJobs, []);

  const deleteJob = async (id) => {
    if (!confirm('Delete this job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted');
      fetchJobs();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Company Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/company/transactions" className="btn-secondary text-sm py-2 px-4">Transactions</Link>
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus size={18} /> Post Job
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-20" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">No jobs posted yet</p>
          <Button onClick={() => setShowCreate(true)} className="mt-4">Post Your First Job</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold line-clamp-1">{job.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className={getStatusColor(job.status)}>{job.status}</span>
                  <span>{job.type}</span>
                  <span>{formatDate(job.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={`/company/applicants/${job.id}`} className="flex items-center gap-1 text-sm text-gold-600 hover:underline">
                  <Users size={16} /> {job.applicant_count} applicants
                </Link>
                <button onClick={() => deleteJob(job.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateJobModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchJobs(); }} />
    </div>
  );
}

function CreateJobModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', requiredSkills: [], location: '', type: 'internship',
    industry: '', experienceLevel: 'entry', salaryRange: '', applicationDeadline: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.requiredSkills.includes(s)) {
      setForm({ ...form, requiredSkills: [...form.requiredSkills, s] });
      setSkillInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.requiredSkills.length === 0) { toast.error('Add at least one skill'); return; }
    setSaving(true);
    try {
      await api.post('/jobs', form);
      toast.success('Job posted!');
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post a New Job">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Job Title" value={form.title} onChange={set('title')} required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={set('description')} className="input-field h-24 resize-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
          <div className="flex gap-2 mb-2">
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="input-field flex-1" placeholder="e.g. React" />
            <Button type="button" onClick={addSkill} variant="secondary">Add</Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {form.requiredSkills.map((s) => (
              <span key={s} className="bg-navy-50 text-navy-800 px-2 py-0.5 rounded text-sm flex items-center gap-1">
                {s} <button type="button" onClick={() => setForm({ ...form, requiredSkills: form.requiredSkills.filter((x) => x !== s) })} className="text-navy-400 hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={set('type')} className="input-field">
              <option value="internship">Internship</option>
              <option value="graduate">Graduate</option>
              <option value="graduate_programme">Graduate Programme</option>
              <option value="entry_level">Entry-Level</option>
              <option value="learnership">Learnership</option>
              <option value="part-time">Part-time</option>
              <option value="full-time">Full-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <Input label="Location" value={form.location} onChange={set('location')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Industry" value={form.industry} onChange={set('industry')} />
          <Input label="Salary Range" value={form.salaryRange} onChange={set('salaryRange')} placeholder="e.g. R10k-R15k/mo" />
        </div>
        <Input label="Application Deadline" type="date" value={form.applicationDeadline} onChange={set('applicationDeadline')} />
        <Button type="submit" disabled={saving} className="w-full">{saving ? 'Posting...' : 'Post Job'}</Button>
      </form>
    </Modal>
  );
}
