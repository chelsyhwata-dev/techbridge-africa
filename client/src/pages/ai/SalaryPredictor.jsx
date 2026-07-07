import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

export default function SalaryPredictor() {
  const [paths, setPaths] = useState([]);
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('entry');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/career/paths').then((res) => { setPaths(res.data); if (res.data.length) setRole(res.data[0]); }).catch(() => {});
  }, []);

  const predict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ai/salary-predict', { role, location, experienceLevel });
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-2">
        <DollarSign className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">AI Salary Predictor</h1>
      </div>
      <p className="text-navy-400 mb-6">A realistic salary range for South Africa's junior tech market.</p>

      <form onSubmit={predict} className="card space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
            {paths.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
          <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="input-field">
            <option value="entry">Entry</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
          </select>
        </div>
        <Input label="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Johannesburg, Remote" />
        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Predicting...' : 'Predict Salary'}</Button>
      </form>

      {result && (
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">{result.role} · {result.experienceLevel} · {result.location}</p>
          <p className="text-4xl font-extrabold text-navy-900">R{result.range[0].toLocaleString()} – R{result.range[1].toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">per month</p>
          <p className="text-xs text-gray-400 mt-4">{result.note}</p>
        </div>
      )}
    </div>
  );
}
