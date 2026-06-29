import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-200 mt-auto">
      <div className="h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-navy-800 rounded-lg flex flex-col items-center justify-center border border-navy-700 leading-none">
                <span className="text-white font-extrabold text-[11px] tracking-tight" style={{marginTop:'2px'}}>NX</span>
                <div className="w-5 h-[1.5px] bg-gold-500 rounded-full" style={{margin:'1px 0'}}></div>
                <span className="text-gold-500 text-[6px] font-medium tracking-[2px]">GEN</span>
              </div>
              <span className="font-extrabold text-lg text-white">NexGen <span className="font-light text-gold-400">Hire</span></span>
            </div>
            <p className="text-sm text-navy-400">Next generation hiring for African tech talent.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">For Students</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-gold-400 transition-colors">Create Profile</Link></li>
              <li><Link to="/jobs" className="hover:text-gold-400 transition-colors">Browse Jobs</Link></li>
              <li><Link to="/ai-matches" className="hover:text-gold-400 transition-colors">AI Matches</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">For Companies</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-gold-400 transition-colors">Post Jobs</Link></li>
              <li><Link to="/about" className="hover:text-gold-400 transition-colors">Why NexGen Hire</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-gold-400 transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-gold-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-800 mt-8 pt-8 text-center text-sm text-navy-500">
          &copy; {new Date().getFullYear()} NexGen Hire. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
