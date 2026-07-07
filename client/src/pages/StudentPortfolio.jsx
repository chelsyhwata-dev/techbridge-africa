import { useState, useEffect } from 'react';
import { Github, Trash2, ExternalLink, Sparkles, Copy } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function StudentPortfolio() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', repoUrl: '', demoUrl: '', techStack: '' });
  const [githubUsername, setGithubUsername] = useState('');
  const [importing, setImporting] = useState(false);
  const [draft, setDraft] = useState(null);
  const [drafting, setDrafting] = useState(false);
  const [slug, setSlug] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([
      api.get('/projects').then((r) => setProjects(r.data)),
      api.get('/students/profile').then((r) => setSlug(r.data.portfolio_slug)),
    ]).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const addProject = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title is required');
    try {
      await api.post('/projects', form);
      toast.success('Project added');
      setForm({ title: '', description: '', repoUrl: '', demoUrl: '', techStack: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add project');
    }
  };

  const removeProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      load();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const importGithub = async () => {
    if (!githubUsername) return;
    setImporting(true);
    try {
      const res = await api.post('/projects/import-github', { username: githubUsername });
      toast.success(res.data.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'GitHub import failed');
    } finally {
      setImporting(false);
    }
  };

  const generateDraft = async () => {
    setDrafting(true);
    try {
      const res = await api.get('/ai/portfolio-draft');
      setDraft(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate draft');
    } finally {
      setDrafting(false);
    }
  };

  const portfolioUrl = slug ? `${window.location.origin}/u/${slug}` : null;

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-6" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-navy-900 mb-1">Portfolio Builder</h1>
      <p className="text-navy-400 mb-6">Showcase real work — recruiters trust demonstrated projects over a bullet-point list.</p>

      {portfolioUrl && (
        <div className="card mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Your public portfolio</p>
            <p className="font-medium text-navy-900">{portfolioUrl}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(portfolioUrl); toast.success('Copied!'); }} className="btn-secondary text-sm py-2 px-3"><Copy size={16} /></button>
            <a href={`/u/${slug}`} target="_blank" rel="noreferrer" className="btn-secondary text-sm py-2 px-3"><ExternalLink size={16} /></a>
          </div>
        </div>
      )}

      <div className="card mb-6">
        <h2 className="font-semibold text-navy-900 mb-3 flex items-center gap-2"><Github size={18} /> Import from GitHub</h2>
        <div className="flex gap-2">
          <Input value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="Your GitHub username" className="flex-1" />
          <Button type="button" onClick={importGithub} disabled={importing} variant="secondary">{importing ? 'Importing...' : 'Import'}</Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Pulls your public, non-fork repositories in as portfolio projects.</p>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-navy-900 flex items-center gap-2"><Sparkles size={18} className="text-gold-500" /> AI Portfolio Draft</h2>
          <Button type="button" onClick={generateDraft} disabled={drafting} variant="secondary" className="text-sm py-2 px-4">{drafting ? 'Generating...' : 'Generate'}</Button>
        </div>
        {draft && (
          <div className="bg-navy-50 rounded-lg p-4 text-sm space-y-2">
            <p><span className="font-semibold">Headline:</span> {draft.headline}</p>
            <p><span className="font-semibold">About:</span> {draft.about}</p>
          </div>
        )}
      </div>

      <form onSubmit={addProject} className="card mb-6 space-y-3">
        <h2 className="font-semibold text-navy-900">Add a project manually</h2>
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field h-20 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Repo URL" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} />
          <Input label="Demo URL" value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })} />
        </div>
        <Input label="Tech Stack" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="e.g. React, Node.js, MySQL" />
        <Button type="submit" className="w-full">Add Project</Button>
      </form>

      <div className="space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="card flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-navy-900">{p.title} {p.source === 'github' && <span className="badge-blue ml-2">GitHub</span>}</p>
              {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
              {p.tech_stack && <p className="text-xs text-gray-400 mt-1">{p.tech_stack}</p>}
              <div className="flex gap-3 mt-2">
                {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="text-xs text-gold-600 hover:underline">Repo</a>}
                {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" className="text-xs text-gold-600 hover:underline">Demo</a>}
              </div>
            </div>
            <button onClick={() => removeProject(p.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
