import { useState, useEffect } from 'react';
import { Users, Briefcase, DollarSign, FileText, Trash2, Download, Mail, Eye, Building2, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { formatDate, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [transactions, setTransactions] = useState({ transactions: [], totalRevenue: 0 });
  const [messages, setMessages] = useState({ messages: [], unread: 0 });
  const [banking, setBanking] = useState({ bankName: '', accountHolder: '', accountNumber: '', branchCode: '', accountType: 'Savings', paymentInstructions: '' });
  const [savingBank, setSavingBank] = useState(false);
  const [fraudScan, setFraudScan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'users') api.get('/admin/users').then((res) => setUsers(res.data.users));
    if (tab === 'jobs') api.get('/admin/jobs').then((res) => setJobs(res.data));
    if (tab === 'transactions') api.get('/admin/transactions').then((res) => setTransactions(res.data));
    if (tab === 'messages') api.get('/contact').then((res) => setMessages(res.data));
    if (tab === 'trust') api.get('/admin/fraud-scan').then((res) => setFraudScan(res.data));
    if (tab === 'banking') api.get('/settings/banking').then((res) => {
      setBanking({ bankName: res.data.bank_name || '', accountHolder: res.data.account_holder || '', accountNumber: res.data.account_number || '', branchCode: res.data.branch_code || '', accountType: res.data.account_type || 'Savings', paymentInstructions: res.data.payment_instructions || '' });
    });
  }, [tab]);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((u) => u.filter((x) => x.id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  const deleteJob = async (id) => {
    if (!confirm('Delete this job?')) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      setJobs((j) => j.filter((x) => x.id !== id));
      toast.success('Job deleted');
    } catch { toast.error('Failed'); }
  };

  if (loading || !stats) return <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/4" /></div>;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'jobs', label: 'Jobs' },
    { key: 'transactions', label: 'Revenue' },
    { key: 'messages', label: `Messages${messages.unread ? ` (${messages.unread})` : ''}` },
    { key: 'trust', label: 'Trust & Safety' },
    { key: 'banking', label: 'Banking' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'bg-navy-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Students', value: stats.stats.totalStudents, icon: Users, color: 'text-blue-600' },
              { label: 'Companies', value: stats.stats.totalCompanies, icon: Users, color: 'text-purple-600' },
              { label: 'Total Jobs', value: stats.stats.totalJobs, icon: Briefcase, color: 'text-green-600' },
              { label: 'Open Jobs', value: stats.stats.openJobs, icon: Briefcase, color: 'text-gold-600' },
              { label: 'Applications', value: stats.stats.totalApplications, icon: FileText, color: 'text-orange-600' },
              { label: 'Revenue', value: `R${Number(stats.stats.totalRevenue).toLocaleString()}`, icon: DollarSign, color: 'text-gold-600' },
            ].map((s) => (
              <div key={s.label} className="card text-center">
                <s.icon className={`mx-auto ${s.color} mb-1`} size={22} />
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="card">
            <h2 className="font-semibold mb-4">Recent Applications</h2>
            <div className="space-y-2">
              {stats.recentApplications.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium">{a.student_name}</span>
                    <span className="text-gray-500 text-sm"> applied to </span>
                    <span className="font-medium">{a.job_title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={getStatusColor(a.status)}>{a.status}</span>
                    <span className="text-xs text-gray-400">{formatDate(a.applied_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-gray-500">{u.email} &bull; <span className={`badge-${u.role === 'admin' ? 'red' : u.role === 'company' ? 'blue' : 'green'}`}>{u.role}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{formatDate(u.created_at)}</span>
                {u.role !== 'admin' && (
                  <button onClick={() => deleteUser(u.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'jobs' && (
        <div className="space-y-2">
          {jobs.map((j) => (
            <div key={j.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{j.title}</p>
                <p className="text-sm text-gray-500">{j.company_name} &bull; {j.applicant_count} applicants &bull; <span className={getStatusColor(j.status)}>{j.status}</span></p>
              </div>
              <button onClick={() => deleteJob(j.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}

      {tab === 'transactions' && (
        <>
          <div className="card mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="text-gold-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Total Platform Revenue</p>
                <p className="text-2xl font-bold">R {Number(transactions.totalRevenue).toLocaleString()}</p>
              </div>
            </div>
            <button onClick={() => window.open('/api/admin/transactions/export', '_blank')} className="btn-secondary text-sm flex items-center gap-2">
              <Download size={16} /> Export All
            </button>
          </div>
          <div className="space-y-2">
            {transactions.transactions.map((tx) => (
              <div key={tx.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium">{tx.company_name}</p>
                  <p className="text-sm text-gray-500">{tx.type.replace('_', ' ')} &bull; {tx.reference}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">R {Number(tx.amount).toLocaleString()}</p>
                  <span className={getStatusColor(tx.status)}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'messages' && (
        <div className="space-y-3">
          {messages.messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No messages yet</div>
          ) : messages.messages.map((msg) => (
            <div key={msg.id} className={`card ${!msg.is_read ? 'border-l-4 border-l-gold-500' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="text-navy-600" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold">{msg.name}</p>
                    <p className="text-sm text-gray-500">{msg.email} &bull; {formatDate(msg.created_at)}</p>
                    <p className="text-gray-700 mt-2 whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!msg.is_read && (
                    <button onClick={async () => { await api.patch(`/contact/${msg.id}/read`); setMessages(prev => ({ ...prev, messages: prev.messages.map(m => m.id === msg.id ? { ...m, is_read: true } : m), unread: prev.unread - 1 })); }} className="text-gray-400 hover:text-blue-600" title="Mark as read">
                      <Eye size={16} />
                    </button>
                  )}
                  <button onClick={async () => { await api.delete(`/contact/${msg.id}`); setMessages(prev => ({ ...prev, messages: prev.messages.filter(m => m.id !== msg.id) })); toast.success('Deleted'); }} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'trust' && (
        <div className="space-y-3">
          <div className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-amber-600" size={22} />
              <div>
                <p className="font-semibold text-navy-900">AI Fraud Detection Scan</p>
                <p className="text-sm text-gray-500">{fraudScan ? `${fraudScan.totalFlags} flag(s) found` : 'Loading...'}</p>
              </div>
            </div>
            <button onClick={() => api.get('/admin/fraud-scan').then((res) => setFraudScan(res.data))} className="btn-secondary text-sm py-2 px-4">Rescan</button>
          </div>
          {fraudScan?.flags.length === 0 ? (
            <div className="card text-center text-emerald-600 flex items-center justify-center gap-2 py-8"><CheckCircle2 size={18} /> No fraud signals detected</div>
          ) : fraudScan?.flags.map((f, i) => (
            <div key={i} className="card border-l-4 border-l-amber-500">
              <p className="text-sm font-medium text-navy-900">{f.type.replace(/_/g, ' ')}</p>
              <p className="text-sm text-gray-600">{f.detail}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'banking' && (
        <div className="card max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="text-gold-600" size={24} />
            <div>
              <h3 className="font-semibold text-navy-900">Platform Banking Details</h3>
              <p className="text-sm text-navy-400">Companies will see these details when choosing EFT payment</p>
            </div>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setSavingBank(true);
            try {
              await api.put('/settings/banking', banking);
              toast.success('Banking details saved');
            } catch { toast.error('Failed to save'); }
            finally { setSavingBank(false); }
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Bank Name</label>
              <input value={banking.bankName} onChange={(e) => setBanking({ ...banking, bankName: e.target.value })} className="input-field" placeholder="e.g. FNB, Standard Bank, Capitec" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Account Holder</label>
              <input value={banking.accountHolder} onChange={(e) => setBanking({ ...banking, accountHolder: e.target.value })} className="input-field" placeholder="e.g. NexGen Hire (Pty) Ltd" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Account Number</label>
                <input value={banking.accountNumber} onChange={(e) => setBanking({ ...banking, accountNumber: e.target.value })} className="input-field" placeholder="e.g. 62000000000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Branch Code</label>
                <input value={banking.branchCode} onChange={(e) => setBanking({ ...banking, branchCode: e.target.value })} className="input-field" placeholder="e.g. 250655" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Account Type</label>
              <select value={banking.accountType} onChange={(e) => setBanking({ ...banking, accountType: e.target.value })} className="input-field">
                <option>Savings</option>
                <option>Cheque</option>
                <option>Current</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Payment Instructions</label>
              <textarea value={banking.paymentInstructions} onChange={(e) => setBanking({ ...banking, paymentInstructions: e.target.value })} className="input-field h-24 resize-none" placeholder="Instructions shown to companies..." />
            </div>
            <button type="submit" disabled={savingBank} className="btn-gold w-full flex items-center justify-center gap-2">
              <Save size={18} /> {savingBank ? 'Saving...' : 'Save Banking Details'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
