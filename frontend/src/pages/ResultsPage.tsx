import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowLeft, CheckCircle, XCircle, Eye, Share2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const ResultsPage = () => {
  const { id } = useParams(); // result ID
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        // Fetch the result by ID
        const resultRes = await axios.get(`${BACKEND_URL}/api/results/${id}`);
        const resultData = resultRes.data;
        setResult(resultData);
        
        // Fetch the quiz
        const quizRes = await axios.get(`${BACKEND_URL}/api/quiz/${resultData.quizId}`);
        setQuiz(quizRes.data);
      } catch (err) {
        console.error("Failed to load result:", err);
        toast.error("Failed to load quiz result");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, navigate]);

  const shareResults = () => {
    if (!quiz || !result) return;
    const text = `I scored ${result.score}/${result.totalQuestions} (${Math.round((result.score / result.totalQuestions) * 100)}%) on the ${quiz.topic} quiz! 🎉`;
    
    if (navigator.share) {
      navigator.share({
        title: "Quiz Results",
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Results copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!quiz || !result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <p className="text-white">Result not found</p>
      </div>
    );
  }

  const percentageScore = Math.round((result.score / result.totalQuestions) * 100);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8">
      <div className="w-full max-w-5xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Results Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-xl bg-slate-800/50 backdrop-blur-md border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">
                {result.score}/{result.totalQuestions}
              </div>
              <div className="text-slate-400">Score</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-slate-800/50 backdrop-blur-md border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {percentageScore}%
              </div>
              <div className="text-slate-400">Accuracy</div>
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-slate-800/50 backdrop-blur-md border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-indigo-400 mb-2">
                {quiz.topic}
              </div>
              <div className="text-slate-400">Topic</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button 
            onClick={() => setShowAnswers(!showAnswers)} 
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showAnswers ? "Hide" : "Show"} Detailed Answers
          </Button>
          <Button 
            onClick={shareResults} 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
          <Button 
            onClick={() => navigate(`/quiz/${quiz._id}/leaderboard`)} 
            variant="outline" 
            className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
          >
            <Trophy className="w-4 h-4 mr-2" />
            View Leaderboard
          </Button>
        </div>

        {/* Answer Review Section */}
        {showAnswers && (
          <Card className="shadow-xl bg-slate-800/50 backdrop-blur-md border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-cyan-400" />
                Detailed Answer Review
              </CardTitle>
              <p className="text-slate-400">Review all questions with correct answers</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quiz.questions.map((question: any, index: number) => {
                  const userAnswer = result.answers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect 
                          ? 'bg-emerald-500/10 border-emerald-500/50' 
                          : 'bg-red-500/10 border-red-500/50'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">
                            Question {index + 1}. {question.question}
                          </h4>
                        </div>
                      </div>
                      
                      <div className="ml-8 space-y-2">
                        {question.options.map((option: string, optIndex: number) => {
                          const isUserAnswer = userAnswer === optIndex;
                          const isCorrectAnswer = question.correctAnswer === optIndex;
                          
                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg text-sm ${
                                isCorrectAnswer
                                  ? 'bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-300'
                                  : isUserAnswer
                                  ? 'bg-red-500/20 border-2 border-red-500/50 text-red-300'
                                  : 'bg-slate-900/50 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{String.fromCharCode(65 + optIndex)}.</span>
                                <span>{option}</span>
                                {isCorrectAnswer && (
                                  <Badge className="ml-auto bg-emerald-500 text-white text-xs">✓ Correct Answer</Badge>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <Badge className="ml-auto bg-red-500 text-white text-xs">✗ Your Answer</Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
