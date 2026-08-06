import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import axios from "axios";
// Wrapper to fetch quiz by id from backend for /quiz/:id/take
function QuizTakerWrapper({ onComplete }: { onComplete: (results: any) => void }) {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<any>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!id) return;
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    axios.get(`${BACKEND_URL}/api/quiz/${id}`)
      .then(res => setQuiz(res.data))
      .catch(() => navigate("/dashboard"));
  }, [id, navigate]);
  const handleComplete = (results: any) => {
    onComplete(results);
    navigate('/leaderboard');
  };
  if (!quiz) return <div className="flex items-center justify-center min-h-screen">Loading quiz...</div>;
  return <QuizTaker quiz={quiz} onBack={() => navigate('/quiz')} onComplete={handleComplete} />;
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import RoadmapsPage from "./pages/RoadmapsPage";
import RoadmapCreatorPage from "./pages/RoadmapCreatorPage";
import RoadmapDetailPage from "./pages/RoadmapDetailPage";
import RoadmapStepPage from "./pages/RoadmapStepPage";
import NotesPage from "./pages/NotesPage";
import ShortNotesPage from "./pages/ShortNotesPage";
import StickyNotesPage from "./pages/StickyNotesPage";
import QuizCreator from "@/components/QuizCreator";
import QuizDisplay from "@/components/QuizDisplay";
import QuizTaker from "@/components/QuizTaker";
import Leaderboard from "@/components/Leaderboard";
import NotFound from "./pages/NotFound";
import LeaderboardPage from "./pages/LeaderboardPage";
import ResultsPage from "./pages/ResultsPage";
import StudyShell from "@/components/study/StudyShell";
import { ThemeProvider } from "@/components/study/ThemeProvider";

const queryClient = new QueryClient();

const App = () => {
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState<any>(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [currentQuiz, setCurrentQuiz] = useState<any>(() => {
    const saved = localStorage.getItem('currentQuiz');
    return saved ? JSON.parse(saved) : null;
  });
  const [quizResults, setQuizResults] = useState<any>(null);
  // useNavigate can't be used outside Router, so use window.location for redirects in handlers

  useEffect(() => {
    if (authToken) localStorage.setItem('authToken', authToken);
    else localStorage.removeItem('authToken');
  }, [authToken]);
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    if (currentQuiz) localStorage.setItem('currentQuiz', JSON.stringify(currentQuiz));
    else localStorage.removeItem('currentQuiz');
  }, [currentQuiz]);

  const handleLoginSuccess = (token: string, userObj: any) => {
    setAuthToken(token);
    setUser(userObj);
    window.location.href = '/dashboard';
  };
  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  const withShell = (children: ReactNode) => (
    user ? <StudyShell user={user} onLogout={handleLogout} onNavigate={handleNavigate}>{children}</StudyShell> : <Navigate to="/login" />
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HeroSection onLogin={() => window.location.href='/login'} onSignup={() => window.location.href='/signup'} onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/login" element={<LoginPage onSignupRedirect={() => window.location.href='/signup'} onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/signup" element={<SignupPage onLoginRedirect={() => window.location.href='/login'} />} />
              <Route path="/dashboard" element={withShell(<Dashboard user={user} onCreateQuiz={() => window.location.href='/create'} onNavigate={handleNavigate} />)} />
              <Route path="/roadmaps" element={withShell(<RoadmapsPage user={user} />)} />
              <Route path="/roadmaps/create" element={withShell(<RoadmapCreatorPage user={user} />)} />
              <Route path="/roadmaps/:id" element={withShell(<RoadmapDetailPage />)} />
              <Route path="/roadmaps/:id/steps/:stepIndex" element={withShell(<RoadmapStepPage onQuizGenerated={setCurrentQuiz} />)} />
              <Route path="/notes" element={withShell(<NotesPage user={user} />)} />
              <Route path="/short-notes" element={withShell(<ShortNotesPage user={user} />)} />
              <Route path="/sticky-notes" element={withShell(<StickyNotesPage user={user} />)} />
              <Route path="/create" element={withShell(<QuizCreator onBack={() => window.location.href='/dashboard'} onQuizGenerated={setCurrentQuiz} />)} />
              <Route path="/quiz" element={withShell(currentQuiz ? <QuizDisplay quiz={currentQuiz} onBack={() => window.location.href='/dashboard'} /> : <Navigate to="/dashboard" />)} />
              <Route path="/take" element={withShell(currentQuiz ? <QuizTaker quiz={currentQuiz} onBack={() => window.location.href='/quiz'} onComplete={setQuizResults} /> : <Navigate to="/dashboard" />)} />
              <Route path="/quiz/:id/take" element={withShell(<QuizTakerWrapper onComplete={setQuizResults} />)} />
              <Route path="/quiz/:id/leaderboard" element={withShell(<LeaderboardPage />)} />
              <Route path="/results/:id" element={withShell(<ResultsPage />)} />
              <Route path="/leaderboard" element={withShell(currentQuiz && quizResults ? <Leaderboard quiz={currentQuiz} results={quizResults} onBack={() => window.location.href='/take'} onNewQuiz={() => window.location.href='/create'} /> : <Navigate to="/dashboard" />)} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
