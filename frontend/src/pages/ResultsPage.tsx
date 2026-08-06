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
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!quiz || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="aiq-heading">Result not found</p>
      </div>
    );
  }

  const percentageScore = Math.round((result.score / result.totalQuestions) * 100);

  return (
    <div className="min-h-screen w-full py-8">
      <div className="w-full max-w-5xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="aiq-muted mb-6 hover:bg-[var(--theme-subcard)] hover:text-[var(--theme-text)]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Results Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="aiq-card">
            <CardContent className="pt-6 text-center">
              <div className="mb-2 text-4xl font-bold text-[var(--theme-accent)]">
                {result.score}/{result.totalQuestions}
              </div>
              <div className="aiq-muted">Score</div>
            </CardContent>
          </Card>

          <Card className="aiq-card">
            <CardContent className="pt-6 text-center">
              <div className="mb-2 text-4xl font-bold text-[var(--theme-accent)]">
                {percentageScore}%
              </div>
              <div className="aiq-muted">Accuracy</div>
            </CardContent>
          </Card>

          <Card className="aiq-card">
            <CardContent className="pt-6 text-center">
              <div className="mb-2 text-4xl font-bold text-[var(--theme-accent)]">
                {quiz.topic}
              </div>
              <div className="aiq-muted">Topic</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button 
            onClick={() => setShowAnswers(!showAnswers)} 
            className="aiq-button-primary"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showAnswers ? "Hide" : "Show"} Detailed Answers
          </Button>
          <Button 
            onClick={shareResults} 
            variant="outline" 
            className="aiq-button-soft"
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
          <Card className="aiq-card">
            <CardHeader>
              <CardTitle className="aiq-heading flex items-center gap-2 text-2xl font-bold">
                <Eye className="w-6 h-6 text-cyan-400" />
                Detailed Answer Review
              </CardTitle>
              <p className="aiq-muted">Review all questions with correct answers</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quiz.questions.map((question: any, index: number) => {
                  const userAnswer = result.answers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div 
                      key={index} 
                      className={`quiz-review-card p-4 rounded-lg border-2 ${
                        isCorrect 
                          ? 'quiz-review-card-correct' 
                          : 'quiz-review-card-wrong'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <h4 className="aiq-heading mb-2 font-semibold">
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
                              className={`quiz-answer-option p-3 rounded-lg text-sm ${
                                isCorrectAnswer
                                  ? 'quiz-answer-correct'
                                  : isUserAnswer
                                  ? 'quiz-answer-wrong'
                                  : 'quiz-answer-neutral'
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
