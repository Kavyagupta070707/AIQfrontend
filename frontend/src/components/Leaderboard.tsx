import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, ArrowLeft, Share2, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { cachedGet } from "@/lib/api";

interface LeaderboardProps {
  quiz: any;
  results: any;
  onBack: () => void;
  onNewQuiz: () => void;
}

const Leaderboard = ({ quiz, results, onBack, onNewQuiz }: LeaderboardProps) => {
  const [allResults, setAllResults] = useState<any[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await cachedGet(`/api/quiz/${quiz._id}/leaderboard`);
        // Add the current user's result if not present
        let leaderboard = res.data || [];
        const exists = leaderboard.some((r: any) => r.playerName === results.playerName && r.score === results.score);
        if (!exists) {
          leaderboard = [results, ...leaderboard];
        }
        setAllResults(leaderboard);
      } catch (err) {
        toast.error("Failed to load leaderboard");
        setAllResults([results]);
      }
    };
    if (quiz && quiz._id) fetchLeaderboard();
  }, [quiz, results]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-400" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">{rank}</div>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "outline";
    }
  };

  const shareResults = () => {
    const text = `I just completed a quiz about ${quiz.topic} and scored ${results.score}/${results.totalQuestions}! 🎉`;
    
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

  const userRank = allResults.findIndex(r => r.playerName === results.playerName) + 1;
  const percentageScore = Math.round((results.score / results.totalQuestions) * 100);

  return (
    <div className="flex min-h-screen w-full items-center justify-center text-[var(--theme-text)]">
      <div className="w-full max-w-4xl px-4 flex flex-col items-center justify-start py-8">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="aiq-muted mb-8 self-start hover:bg-[var(--theme-subcard)] hover:text-[var(--theme-text)]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Take Quiz Again
        </Button>

        {/* Answer Review Section */}
        {showAnswers && (
          <div className="w-full mb-8">
            <Card className="aiq-card">
              <CardHeader>
                <CardTitle className="aiq-heading flex items-center gap-2 text-2xl font-bold">
                  <Eye className="w-6 h-6 text-cyan-400" />
                  Answer Review
                </CardTitle>
                <p className="aiq-muted">Your answers vs correct answers</p>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                <div className="space-y-4">
                  {quiz.questions.map((question: any, index: number) => {
                    const userAnswer = results.answers[index];
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
                              Q{index + 1}. {question.question}
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
                                    <Badge className="ml-auto bg-emerald-500 text-white text-xs">Correct</Badge>
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <Badge className="ml-auto bg-red-500 text-white text-xs">Your Answer</Badge>
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
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 w-full">
          {/* Personal Results */}
          <div className="lg:col-span-1 flex flex-col justify-start">
            <Card className="aiq-card">
              <CardHeader className="text-center">
                <CardTitle className="aiq-heading text-2xl font-bold">Your Results</CardTitle>
                <p className="aiq-muted">{quiz.topic}</p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-[var(--theme-accent)]">
                    {results.score}/{results.totalQuestions}
                  </div>
                  <div className="aiq-muted text-lg">
                    {percentageScore}% Correct
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  {getRankIcon(userRank)}
                  <Badge className="text-sm bg-indigo-500/20 text-indigo-400 border-indigo-500/50">
                    Rank #{userRank}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowAnswers(!showAnswers)} 
                    variant="outline" 
                    className="aiq-button-soft w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showAnswers ? "Hide" : "View"} Answers
                  </Button>
                  <Button onClick={shareResults} variant="outline" className="aiq-button-soft w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                  <Button onClick={onNewQuiz} className="aiq-button-primary w-full">
                    Create New Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2 flex flex-col justify-start">
            <Card className="aiq-card w-full">
              <CardHeader>
                <CardTitle className="aiq-heading flex items-center gap-2 text-2xl font-bold">
                  <Trophy className="w-6 h-6 text-cyan-400" />
                  Leaderboard
                </CardTitle>
                <p className="aiq-muted">
                  Live rankings for "{quiz.topic}" quiz
                </p>
              </CardHeader>
              <CardContent className="overflow-auto max-h-[60vh]">
                <div className="space-y-3">
                  {allResults.map((result, index) => {
                    const rank = index + 1;
                    const isCurrentUser = result.playerName === results.playerName;
                    return (
                      <div
                        key={`${result.playerName}-${index}`}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                          isCurrentUser 
                            ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg' 
                            : 'aiq-subcard border-[var(--theme-border)] hover:bg-[var(--theme-card-hover)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getRankIcon(rank)}
                          <div className="aiq-heading text-lg font-bold">
                            #{rank}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="aiq-heading flex items-center gap-2 font-semibold">
                            {result.playerName}
                            {isCurrentUser && (
                              <Badge className="text-xs bg-cyan-500 text-slate-900">You</Badge>
                            )}
                          </div>
                          <div className="aiq-muted text-sm">
                            Completed {new Date(result.completedAt).toLocaleTimeString()}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="aiq-heading text-lg font-bold">
                            {result.score}/{result.totalQuestions}
                          </div>
                          <div className="aiq-muted text-sm">
                            {Math.round((result.score / result.totalQuestions) * 100)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stats Summary */}
                <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--theme-border)] pt-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[var(--theme-accent)]">{allResults.length}</div>
                    <div className="aiq-muted text-sm">Participants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {allResults.length > 0 
                        ? (Math.round(allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length * 10) / 10).toFixed(1)
                        : '0.0'}
                    </div>
                    <div className="aiq-muted text-sm">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">
                      {allResults.length > 0 ? Math.max(...allResults.map(r => r.score)) : 0}
                    </div>
                    <div className="aiq-muted text-sm">High Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
