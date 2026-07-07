import { useState, useEffect } from 'react';
import { Award, Gift, Copy } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Rewards() {
  const [badges, setBadges] = useState([]);
  const [referral, setReferral] = useState(null);

  useEffect(() => {
    api.get('/badges/mine').then((res) => setBadges(res.data)).catch(() => {});
    api.get('/referrals/my-code').then((res) => setReferral(res.data)).catch(() => {});
    api.get('/referrals/my-stats').then((res) => setReferral((r) => ({ ...r, ...res.data }))).catch(() => {});
  }, []);

  const referralLink = referral?.code ? `${window.location.origin}/register?ref=${referral.code}` : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-navy-900 mb-6">Badges & Referrals</h1>

      <div className="card mb-6">
        <h2 className="font-semibold text-navy-900 mb-4 flex items-center gap-2"><Award size={18} className="text-gold-500" /> Your Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((b) => (
            <div key={b.key} className={`text-center p-3 rounded-xl ${b.earned ? 'bg-amber-50' : 'bg-gray-50 opacity-50'}`}>
              <Award size={24} className={`mx-auto mb-1 ${b.earned ? 'text-gold-500' : 'text-gray-300'}`} />
              <p className="text-xs font-medium text-navy-800">{b.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-navy-900 mb-3 flex items-center gap-2"><Gift size={18} className="text-gold-500" /> Refer a Friend</h2>
        {referralLink && (
          <>
            <div className="flex gap-2 mb-3">
              <input readOnly value={referralLink} className="input-field flex-1 text-sm" />
              <button onClick={() => { navigator.clipboard.writeText(referralLink); toast.success('Copied!'); }} className="btn-secondary px-3"><Copy size={16} /></button>
            </div>
            <p className="text-sm text-gray-500">{referral.totalReferred || 0} friend{referral.totalReferred === 1 ? '' : 's'} referred{referral.reward ? ` — ${referral.reward}` : ''}</p>
          </>
        )}
      </div>
    </div>
  );
}
