import { useState, useEffect } from 'react';
import api from '../api/axios';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import FileUpload from '../components/common/FileUpload';
import toast from 'react-hot-toast';

export default function CompanyProfile() {
  const [profile, setProfile] = useState({
    companyName: '', industry: '', location: '', country: 'South Africa', website: '', description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/companies/profile').then((res) => {
      const d = res.data;
      setProfile({
        companyName: d.company_name || '', industry: d.industry || '', location: d.location || '',
        country: d.country || 'South Africa', website: d.website || '', description: d.description || '',
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/companies/profile', profile);
      toast.success('Profile saved!');
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;

  const set = (key) => (e) => setProfile({ ...profile, [key]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Company Profile</h1>
      <div className="space-y-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Company Logo</h2>
          <FileUpload endpoint="/companies/upload-logo" accept="image/jpeg,image/png,image/webp" label="Upload logo (JPG/PNG/WebP, max 5MB)" />
        </div>
        <form onSubmit={handleSave} className="card space-y-4">
          <Input label="Company Name" value={profile.companyName} onChange={set('companyName')} required />
          <Input label="Industry" value={profile.industry} onChange={set('industry')} placeholder="e.g. Fintech, EdTech, SaaS" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City / Location" value={profile.location} onChange={set('location')} />
            <Input label="Country" value={profile.country} onChange={set('country')} />
          </div>
          <Input label="Website" value={profile.website} onChange={set('website')} type="url" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={profile.description} onChange={set('description')} className="input-field h-24 resize-none" placeholder="Tell students about your company..." />
          </div>
          <Button type="submit" disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save Profile'}</Button>
        </form>
      </div>
    </div>
  );
}
