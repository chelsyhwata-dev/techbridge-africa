import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, Briefcase, User, LogOut, LayoutDashboard } from 'lucide-react';

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
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const dashboardLink = user?.role === 'student' ? '/ai-matches'
    : user?.role === 'company' ? '/company/dashboard'
    : user?.role === 'admin' ? '/admin' : null;

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-navy-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
              <span className="text-gold-500 font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-xl text-navy-900">TechBridge <span className="text-gold-500">Africa</span></span>
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
                <Link to={user.role === 'company' ? '/company/profile' : '/student/profile'} className="text-navy-700 hover:text-gold-600 font-medium flex items-center gap-1">
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
