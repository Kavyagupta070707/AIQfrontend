import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, BookOpen, Trophy, Calendar, Users, Target } from "lucide-react";
import axios from "axios";

const Dashboard = ({ user, authToken, onCreateQuiz, onShowQuiz, onNavigate }) => {
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [attendedQuizzes, setAttendedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        const [createdRes, attendedRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/quiz?createdBy=${user._id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          }),
          axios.get(`${BACKEND_URL}/api/results?userId=${user._id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          })
        ]);
        setMyQuizzes(createdRes.data);
        setAttendedQuizzes(attendedRes.data);
      } catch (err) {
        setMyQuizzes([]);
        setAttendedQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    if (user && authToken) fetchData();
  }, [user, authToken]);

  return (
    <>
      {(!user) && <div className="flex items-center justify-center min-h-screen">Please log in to view the dashboard.</div>}
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8">
      <div className="w-full max-w-6xl px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-slate-400 mt-2">Manage your quizzes and track your progress</p>
            </div>
            <Button onClick={onCreateQuiz} size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Quiz
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">Quizzes Created</p>
                    <p className="text-3xl font-bold mt-2">{myQuizzes.length}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-cyan-200 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Quizzes Attended</p>
                    <p className="text-3xl font-bold mt-2">{attendedQuizzes.length}</p>
                  </div>
                  <Trophy className="w-12 h-12 text-blue-200 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Avg Score</p>
                    <p className="text-3xl font-bold mt-2">
                      {attendedQuizzes.length > 0 
                        ? Math.round(attendedQuizzes.reduce((acc, r) => acc + (r.score / r.totalQuestions * 100), 0) / attendedQuizzes.length)
                        : 0}%
                    </p>
                  </div>
                  <Target className="w-12 h-12 text-indigo-200 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quizzes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-xl bg-slate-800/50 backdrop-blur-md border-slate-700">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-blue-900/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <CardTitle className="text-white">My Created Quizzes</CardTitle>
              </div>
              <CardDescription className="text-slate-400">Click on any quiz to view details and share</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : myQuizzes.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
                  <p className="text-slate-400">No quizzes created yet.</p>
                  <Button onClick={onCreateQuiz} variant="link" className="mt-2 text-cyan-400">
                    Create your first quiz
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {myQuizzes.map((quiz) => {
                    const handleCreatedQuizClick = () => {
                      console.log('Clicked quiz:', quiz);
                      onShowQuiz(quiz);
                      onNavigate('/quiz');
                    };
                    
                    return (
                      <div 
                        key={quiz._id} 
                        className="group p-4 rounded-lg border-2 border-slate-700 hover:border-cyan-500/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
                        onClick={handleCreatedQuizClick}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-white group-hover:text-cyan-400 transition-colors">
                              {quiz.topic}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(quiz.createdAt).toLocaleDateString()}
                              </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {quiz.participantCount || quiz.participants?.length || 0} participants
                            </span>
                            </div>
                          </div>
                          <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium">
                            {quiz.questions?.length || 0} Qs
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-slate-800/50 backdrop-blur-md border-slate-700">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-indigo-900/50">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-white">My Quiz Results</CardTitle>
              </div>
              <CardDescription className="text-slate-400">View your performance on attended quizzes</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                </div>
              ) : attendedQuizzes.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
                  <p className="text-slate-400">No quizzes attended yet.</p>
                  <p className="text-sm text-slate-500 mt-1">Take a quiz to see your results here!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {attendedQuizzes.map((result) => {
                    const handleQuizClick = () => {
                      // Navigate to results page with quiz ID and result ID
                      onNavigate(`/results/${result._id}`);
                    };
                    
                    const percentage = Math.round((result.score / result.totalQuestions) * 100);
                    const getScoreColor = (pct: number) => {
                      if (pct >= 80) return 'text-emerald-400 bg-emerald-500/20';
                      if (pct >= 60) return 'text-blue-400 bg-blue-500/20';
                      if (pct >= 40) return 'text-orange-400 bg-orange-500/20';
                      return 'text-red-400 bg-red-500/20';
                    };
                    
                    return result.topic ? (
                      <div 
                        key={result._id} 
                        className="group p-4 rounded-lg border-2 border-slate-700 hover:border-blue-500/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
                        onClick={handleQuizClick}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">
                              {result.topic}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(result.completedAt || Date.now()).toLocaleDateString()}
                              </span>
                              <span>
                                Score: {result.score}/{result.totalQuestions}
                              </span>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(percentage)}`}>
                            {percentage}%
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
