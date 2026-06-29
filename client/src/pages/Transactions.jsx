import { useState, useEffect } from 'react';
import { Download, DollarSign, CreditCard, Star, Zap, Crown, CheckCircle, Lock, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import { formatDate, getStatusColor } from '../utils/helpers';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

const PLAN_ICONS = { premium_listing: Star, featured_post: Zap, subscription: Crown };

export default function Transactions() {
  const [data, setData] = useState({ transactions: [], total: 0, totalSpent: 0 });
  const [pricing, setPricing] = useState({});
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchTransactions = (params = {}) => {
    setLoading(true);
    api.get('/transactions', { params: { ...filters, ...params } })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
    api.get('/payments/pricing').then((res) => setPricing(res.data));
  }, []);

  const exportCSV = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/transactions/export?token=${token}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-navy-900">Transactions</h1>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
          <Button onClick={() => setShowCheckout(true)} className="flex items-center gap-2">
            <CreditCard size={18} /> Buy Credits
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="card mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center">
            <DollarSign className="text-gold-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-navy-400">Total Spent</p>
            <p className="text-2xl font-bold text-navy-900">R {Number(data.totalSpent).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input-field w-auto">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="input-field w-auto" />
        <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="input-field w-auto" />
        <button onClick={() => fetchTransactions()} className="btn-primary text-sm">Filter</button>
      </div>

      {/* Transaction list */}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}</div>
      ) : data.transactions.length === 0 ? (
        <div className="text-center py-12 text-navy-400">
          <CreditCard size={48} className="mx-auto mb-4 text-navy-200" />
          <p className="text-lg font-medium">No transactions yet</p>
          <p className="text-sm mt-1">Purchase a premium listing to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.transactions.map((tx) => {
            const Icon = PLAN_ICONS[tx.type] || DollarSign;
            return (
              <div key={tx.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
                    <Icon className="text-gold-600" size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">{tx.description || tx.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-navy-400">{tx.reference} &bull; {formatDate(tx.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-navy-900">R {Number(tx.amount).toLocaleString()}</p>
                  <span className={getStatusColor(tx.status)}>{tx.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Checkout Modal */}
      <Modal isOpen={showCheckout} onClose={() => { setShowCheckout(false); setSelectedPlan(null); }} title={selectedPlan ? 'Payment Details' : 'Choose a Plan'}>
        {!selectedPlan ? (
          <PlanSelector pricing={pricing} onSelect={setSelectedPlan} />
        ) : (
          <CardPaymentForm
            plan={selectedPlan}
            pricing={pricing}
            onSuccess={() => {
              setShowCheckout(false);
              setSelectedPlan(null);
              fetchTransactions();
            }}
            onBack={() => setSelectedPlan(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function PlanSelector({ pricing, onSelect }) {
  return (
    <div>
      <p className="text-navy-400 text-sm mb-6">Choose a plan to boost your job visibility and attract top talent.</p>
      <div className="space-y-4">
        {Object.entries(pricing).map(([type, plan]) => {
          const Icon = PLAN_ICONS[type] || DollarSign;
          return (
            <button key={type} onClick={() => onSelect(type)}
              className="w-full border border-navy-100 rounded-xl p-4 hover:border-gold-400 transition-all text-left group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center group-hover:bg-gold-100 transition-colors">
                    <Icon className="text-gold-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900">{plan.label}</p>
                    <p className="text-sm text-navy-400">
                      {type === 'premium_listing' && 'Top placement + gold badge for your listing'}
                      {type === 'featured_post' && 'Extra visibility boost for any listing'}
                      {type === 'subscription' && 'Unlimited premium posts for 12 months'}
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-navy-900 ml-4">R{plan.amount}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CardPaymentForm({ plan, pricing, onSuccess, onBack }) {
  const planData = pricing[plan];
  const [form, setForm] = useState({ cardName: '', cardNumber: '', expiryDate: '', cvv: '' });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const luhnCheck = (num) => {
    const digits = num.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(digits)) return false;
    let sum = 0, alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.cardName.trim() || form.cardName.trim().length < 2) {
      toast.error('Enter a valid cardholder name');
      return;
    }
    if (!luhnCheck(form.cardNumber)) {
      toast.error('Invalid card number. Please check and try again.');
      return;
    }
    const expiryMatch = form.expiryDate.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) {
      toast.error('Enter expiry as MM/YY');
      return;
    }
    const expMonth = parseInt(expiryMatch[1], 10);
    const expYear = parseInt('20' + expiryMatch[2], 10);
    if (expMonth < 1 || expMonth > 12 || new Date(expYear, expMonth) <= new Date()) {
      toast.error('Card has expired or expiry date is invalid');
      return;
    }
    if (!/^\d{3,4}$/.test(form.cvv)) {
      toast.error('CVV must be 3 or 4 digits');
      return;
    }
    setShowConfirm(true);
  };

  const confirmPayment = async () => {
    setShowConfirm(false);
    setProcessing(true);
    try {
      const res = await api.post('/payments/process', { type: plan, ...form });
      setSuccess(res.data);
      toast.success('Payment successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-emerald-600" size={32} />
        </div>
        <h3 className="text-xl font-bold text-navy-900 mb-2">Payment Successful!</h3>
        <p className="text-navy-400 mb-1">R{success.amount} paid for {success.label}</p>
        <p className="text-sm text-navy-300">Reference: {success.reference}</p>
        <button onClick={onSuccess} className="btn-gold mt-6">Done</button>
      </div>
    );
  }

  const Icon = PLAN_ICONS[plan] || DollarSign;

  return (
    <div>
      {/* Plan summary */}
      <div className="flex items-center justify-between bg-navy-50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <Icon className="text-gold-600" size={20} />
          <span className="font-medium text-navy-900">{planData.label}</span>
        </div>
        <span className="text-xl font-bold text-navy-900">R{planData.amount}</span>
      </div>

      {/* Card form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Cardholder Name</label>
          <input
            type="text"
            value={form.cardName}
            onChange={(e) => setForm({ ...form, cardName: e.target.value })}
            placeholder="John Doe"
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Card Number</label>
          <div className="relative">
            <input
              type="text"
              value={form.cardNumber}
              onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
              placeholder="1234 5678 9012 3456"
              className="input-field pl-10"
              maxLength={19}
              required
            />
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" size={18} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Expiry Date</label>
            <input
              type="text"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: formatExpiry(e.target.value) })}
              placeholder="MM/YY"
              className="input-field"
              maxLength={5}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">CVV</label>
            <input
              type="password"
              value={form.cvv}
              onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              placeholder="123"
              className="input-field"
              maxLength={4}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={processing} className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-lg">
          {processing ? (
            <>Processing...</>
          ) : (
            <><Lock size={18} /> Pay R{planData.amount}</>
          )}
        </button>

        <button type="button" onClick={onBack} className="w-full text-center text-sm text-navy-400 hover:text-navy-600 mt-2">
          &larr; Choose a different plan
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-navy-300 mt-4">
          <ShieldCheck size={14} />
          <span>Secure payment &bull; Your card details are encrypted</span>
        </div>
      </form>

      {/* Confirmation overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative z-10 text-center">
            <div className="w-14 h-14 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-gold-600" size={28} />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">Confirm Payment</h3>
            <p className="text-navy-400 mb-1">You are about to pay</p>
            <p className="text-3xl font-bold text-navy-900 mb-1">R{planData.amount}</p>
            <p className="text-sm text-navy-400 mb-6">for {planData.label}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={confirmPayment} className="btn-gold flex-1 flex items-center justify-center gap-2">
                <Lock size={16} /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
