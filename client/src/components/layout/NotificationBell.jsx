import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import api from '../../api/axios';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = () => {
    api.get('/notifications/unread-count').then((res) => setUnread(res.data.count)).catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = async () => {
    setOpen(!open);
    if (!open) {
      const res = await api.get('/notifications').catch(() => ({ data: [] }));
      setNotifications(res.data);
      await api.patch('/notifications/read-all').catch(() => {});
      setUnread(0);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="relative text-navy-700 hover:text-gold-600">
        <Bell size={20} />
        {unread > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 p-4 text-center">No notifications yet.</p>
          ) : notifications.map((n) => (
            <Link key={n.id} to={n.link || '#'} onClick={() => setOpen(false)} className="block px-4 py-3 border-b border-gray-50 hover:bg-navy-50/50 last:border-none">
              <p className="text-sm text-navy-800">{n.content}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
