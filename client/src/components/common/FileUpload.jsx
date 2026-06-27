import { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function FileUpload({ endpoint, accept, label, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(endpoint.includes('cv') ? 'cv' : endpoint.includes('logo') ? 'logo' : 'profileImage', file);

    setUploading(true);
    try {
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploaded(true);
      toast.success(res.data.message || 'File uploaded');
      onSuccess?.(res.data.path);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gold-400 hover:bg-navy-50/50 transition-colors">
      {uploaded ? <CheckCircle className="text-green-500" size={20} /> : <Upload className="text-gray-400" size={20} />}
      <span className="text-sm text-gray-600">
        {uploading ? 'Uploading...' : uploaded ? 'Uploaded!' : label}
      </span>
      <input type="file" accept={accept} onChange={handleUpload} className="hidden" disabled={uploading} />
    </label>
  );
}
