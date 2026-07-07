import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import StudentProfile from './pages/StudentProfile';
import StudentDashboard from './pages/StudentDashboard';
import StudentSkills from './pages/StudentSkills';
import StudentPortfolio from './pages/StudentPortfolio';
import StudentReadiness from './pages/StudentReadiness';
import StudentAnalytics from './pages/StudentAnalytics';
import CareerRoadmap from './pages/CareerRoadmap';
import Rewards from './pages/Rewards';
import PublicPortfolio from './pages/PublicPortfolio';
import AIMatches from './pages/AIMatches';
import Applications from './pages/Applications';
import CompanyProfile from './pages/CompanyProfile';
import CompanyDashboard from './components/dashboard/CompanyDashboard';
import CompanyApplicants from './pages/CompanyApplicants';
import CompanyAnalytics from './pages/CompanyAnalytics';
import RecruiterSearch from './pages/RecruiterSearch';
import Transactions from './pages/Transactions';
import AdminPanel from './pages/AdminPanel';
import UniversityDashboard from './pages/UniversityDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Assessments from './pages/Assessments';
import Messages from './pages/Messages';
import Events from './pages/Events';
import { QAList, QADetail } from './pages/QA';
import ResumeAnalyzer from './pages/ai/ResumeAnalyzer';
import CareerCoach from './pages/ai/CareerCoach';
import SkillGapAnalysis from './pages/ai/SkillGapAnalysis';
import InterviewSimulator from './pages/ai/InterviewSimulator';
import SalaryPredictor from './pages/ai/SalaryPredictor';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/u/:slug" element={<PublicPortfolio />} />
      <Route path="/community/events" element={<Events />} />
      <Route path="/community/qa" element={<QAList />} />
      <Route path="/community/qa/:id" element={<QADetail />} />

      <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/skills" element={<ProtectedRoute roles={['student']}><StudentSkills /></ProtectedRoute>} />
      <Route path="/student/portfolio" element={<ProtectedRoute roles={['student']}><StudentPortfolio /></ProtectedRoute>} />
      <Route path="/student/readiness" element={<ProtectedRoute roles={['student']}><StudentReadiness /></ProtectedRoute>} />
      <Route path="/student/analytics" element={<ProtectedRoute roles={['student']}><StudentAnalytics /></ProtectedRoute>} />
      <Route path="/student/roadmap" element={<ProtectedRoute roles={['student']}><CareerRoadmap /></ProtectedRoute>} />
      <Route path="/student/rewards" element={<ProtectedRoute roles={['student']}><Rewards /></ProtectedRoute>} />
      <Route path="/ai-matches" element={<ProtectedRoute roles={['student']}><AIMatches /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute roles={['student']}><Applications /></ProtectedRoute>} />
      <Route path="/assessments" element={<ProtectedRoute roles={['student']}><Assessments /></ProtectedRoute>} />

      <Route path="/ai/resume-analyzer" element={<ProtectedRoute roles={['student']}><ResumeAnalyzer /></ProtectedRoute>} />
      <Route path="/ai/career-coach" element={<ProtectedRoute roles={['student']}><CareerCoach /></ProtectedRoute>} />
      <Route path="/ai/skill-gap" element={<ProtectedRoute roles={['student']}><SkillGapAnalysis /></ProtectedRoute>} />
      <Route path="/ai/interview-simulator" element={<ProtectedRoute roles={['student']}><InterviewSimulator /></ProtectedRoute>} />
      <Route path="/ai/salary-predictor" element={<ProtectedRoute roles={['student', 'company']}><SalaryPredictor /></ProtectedRoute>} />

      <Route path="/messages" element={<ProtectedRoute roles={['student', 'company', 'university']}><Messages /></ProtectedRoute>} />

      <Route path="/company/profile" element={<ProtectedRoute roles={['company']}><CompanyProfile /></ProtectedRoute>} />
      <Route path="/company/dashboard" element={<ProtectedRoute roles={['company']}><CompanyDashboard /></ProtectedRoute>} />
      <Route path="/company/applicants/:jobId" element={<ProtectedRoute roles={['company']}><CompanyApplicants /></ProtectedRoute>} />
      <Route path="/company/transactions" element={<ProtectedRoute roles={['company']}><Transactions /></ProtectedRoute>} />
      <Route path="/company/analytics" element={<ProtectedRoute roles={['company']}><CompanyAnalytics /></ProtectedRoute>} />
      <Route path="/company/candidates" element={<ProtectedRoute roles={['company']}><RecruiterSearch /></ProtectedRoute>} />

      <Route path="/university/dashboard" element={<ProtectedRoute roles={['university']}><UniversityDashboard /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', padding: '12px 16px' } }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
