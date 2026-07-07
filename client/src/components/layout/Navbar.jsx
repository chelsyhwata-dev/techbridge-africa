import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, Briefcase, User, LogOut, LayoutDashboard, MessageSquare, Users } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const navLinks = [
    { to: '/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/community/events', label: 'Community' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const dashboardLink = user?.role === 'student' ? '/student/dashboard'
    : user?.role === 'company' ? '/company/dashboard'
    : user?.role === 'university' ? '/university/dashboard'
    : user?.role === 'admin' ? '/admin' : null;

  const profileLink = user?.role === 'company' ? '/company/profile' : user?.role === 'university' ? '/university/dashboard' : '/student/profile';

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-navy-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-navy-900 rounded-lg flex flex-col items-center justify-center leading-none">
              <span className="text-white font-extrabold text-[11px] tracking-tight" style={{marginTop:'2px'}}>NX</span>
              <div className="w-5 h-[1.5px] bg-gold-500 rounded-full" style={{margin:'1px 0'}}></div>
              <span className="text-gold-500 text-[6px] font-medium tracking-[2px]">GEN</span>
            </div>
            <span className="font-extrabold text-xl text-navy-900">NexGen <span className="font-light text-gold-500">Hire</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-navy-700 hover:text-gold-600 font-medium transition-colors">
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {dashboardLink && (
                  <Link to={dashboardLink} className="text-navy-700 hover:text-gold-600 font-medium flex items-center gap-1">
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                )}
                {user.role === 'company' && (
                  <Link to="/company/candidates" className="text-navy-700 hover:text-gold-600 font-medium flex items-center gap-1">
                    <Users size={18} /> Candidates
                  </Link>
                )}
                <Link to="/messages" className="text-navy-700 hover:text-gold-600 font-medium flex items-center gap-1">
                  <MessageSquare size={18} />
                </Link>
                <NotificationBell />
                <Link to={profileLink} className="text-navy-700 hover:text-gold-600 font-medium flex items-center gap-1">
                  <User size={18} /> Profile
                </Link>
                <button onClick={handleLogout} className="text-navy-400 hover:text-red-600 flex items-center gap-1 font-medium">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Log In</Link>
                <Link to="/register" className="btn-gold text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}
          </div>

          <button className="md:hidden text-navy-900" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="block px-3 py-2 text-navy-700 hover:bg-navy-50 rounded-lg font-medium">
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {dashboardLink && (
                  <Link to={dashboardLink} onClick={() => setOpen(false)} className="block px-3 py-2 text-navy-700 hover:bg-navy-50 rounded-lg font-medium">
                    Dashboard
                  </Link>
                )}
                {user.role === 'company' && (
                  <Link to="/company/candidates" onClick={() => setOpen(false)} className="block px-3 py-2 text-navy-700 hover:bg-navy-50 rounded-lg font-medium">
                    Candidates
                  </Link>
                )}
                <Link to="/messages" onClick={() => setOpen(false)} className="block px-3 py-2 text-navy-700 hover:bg-navy-50 rounded-lg font-medium">
                  Messages
                </Link>
                <Link to={profileLink} onClick={() => setOpen(false)} className="block px-3 py-2 text-navy-700 hover:bg-navy-50 rounded-lg font-medium">
                  Profile
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3 pt-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary text-sm py-2 px-4 flex-1 text-center">Log In</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-gold text-sm py-2 px-4 flex-1 text-center">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
