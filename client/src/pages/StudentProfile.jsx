import { useState, useEffect } from 'react';
import api from '../api/axios';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import FileUpload from '../components/common/FileUpload';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    name: '', university: '', yearOfStudy: '1st Year', location: '', country: 'South Africa',
    status: 'Current Student', graduationYear: '',
    bio: '', skills: [], githubUrl: '', linkedinUrl: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/students/profile').then((res) => {
      const d = res.data;
      let skills = d.skills;
      if (typeof skills === 'string') skills = JSON.parse(skills);
      setProfile({
        name: d.name || '', university: d.university || '', yearOfStudy: d.year_of_study || '1st Year',
        location: d.location || '', country: d.country || 'South Africa',
        status: d.status || 'Current Student', graduationYear: d.graduation_year || '',
        bio: d.bio || '',
        skills: Array.isArray(skills) ? skills : [], githubUrl: d.github_url || '', linkedinUrl: d.linkedin_url || '',
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !profile.skills.includes(s)) {
      setProfile({ ...profile, skills: [...profile.skills, s] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/students/profile', profile);
      toast.success('Profile saved!');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-6" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Student Profile</h1>

      <div className="space-y-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Uploads</h2>
          <div className="space-y-3">
            <FileUpload endpoint="/students/upload-image" accept="image/jpeg,image/png,image/webp" label="Upload profile picture (JPG/PNG/WebP, max 5MB)" />
            <FileUpload endpoint="/students/upload-cv" accept="application/pdf" label="Upload CV/Resume (PDF, max 10MB)" />
          </div>
        </div>

        <form onSubmit={handleSave} className="card space-y-4">
          <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input label="University" value={profile.university} onChange={(e) => setProfile({ ...profile, university: e.target.value })} placeholder="e.g. University of Cape Town" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
            <select value={profile.yearOfStudy} onChange={(e) => setProfile({ ...profile, yearOfStudy: e.target.value })} className="input-field">
              {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Honours', 'Masters', 'PhD', 'Graduate'].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={profile.status} onChange={(e) => setProfile({ ...profile, status: e.target.value })} className="input-field">
                <option value="Current Student">Current Student</option>
                <option value="Recent Graduate">Recent Graduate</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
            {(profile.status === 'Recent Graduate' || profile.status === 'Alumni') && (
              <Input label="Graduation Year" type="number" value={profile.graduationYear} onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })} placeholder="e.g. 2025" min="2000" max="2030" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="City / Location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
            <Input label="Country" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="input-field h-24 resize-none" placeholder="Tell companies about yourself..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <div className="flex gap-2 mb-2">
              <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="input-field flex-1" placeholder="e.g. Python, React, MySQL" />
              <Button type="button" onClick={addSkill} variant="secondary">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="bg-navy-50 text-navy-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                  {skill} <button type="button" onClick={() => removeSkill(skill)}><X size={14} /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="GitHub URL" value={profile.githubUrl} onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })} />
            <Input label="LinkedIn URL" value={profile.linkedinUrl} onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })} />
          </div>

          <Button type="submit" disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save Profile'}</Button>
        </form>
      </div>
    </div>
  );
}
