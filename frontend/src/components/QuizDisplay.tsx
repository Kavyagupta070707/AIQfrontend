import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, QrCode, Users, Copy, Share2, Trophy } from "lucide-react";
import { toast } from "sonner";
import QRCodeGenerator from "./QRCodeGenerator";

 interface QuizDisplayProps {
  quiz: any;
  onBack: () => void;
}

const QuizDisplay = ({ quiz, onBack }: QuizDisplayProps) => {
  const navigate = useNavigate();
  const quizId = quiz._id || quiz.id;
  
  const handleStartQuiz = () => {
    navigate(`/quiz/${quizId}/take`);
  };
  
  const handleViewLeaderboard = () => {
    navigate(`/quiz/${quizId}/leaderboard`);
  };
  
  const [showQRCode, setShowQRCode] = useState(false);
  const quizUrl = `${window.location.origin}/quiz/${quizId}/take`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quizUrl);
    toast.success("Quiz link copied to clipboard!");
  };

  const shareQuiz = () => {
    if (navigator.share) {
      navigator.share({
        title: `Quiz: ${quiz.topic}`,
        text: `Join this interactive quiz about ${quiz.topic}!`,
        url: quizUrl,
      });
    } else {
      copyToClipboard();
    }
  };
   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  const handlePrevious = () => {
    if (currentQuestionIndex >0) {
      setCurrentQuestionIndex(prev => prev -1);
    }
  };

  const question = quiz.questions[currentQuestionIndex];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Create Another Quiz
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quiz Info */}
          <Card className="shadow-xl bg-slate-800/50 backdrop-blur-md border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Quiz Generated Successfully!
              </CardTitle>
              <p className="text-slate-400">
                Your quiz about <span className="font-semibold text-cyan-400">{quiz.topic}</span> is ready to share
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Quiz Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-400">{quiz.questions.length}</div>
                  <div className="text-sm text-slate-400">Questions</div>
                </div>
                <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{quiz.participantCount || quiz.participants?.length || 0}</div>
                  <div className="text-sm text-slate-400">Participants</div>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-3">
                <Button
                  onClick={() => setShowQRCode(!showQRCode)}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {showQRCode ? "Hide QR Code" : "Show QR Code"}
                </Button>

                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button onClick={shareQuiz} variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Start Quiz */}
              <Button onClick={handleStartQuiz} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900">
                <Users className="w-4 h-4 mr-2" />
                Attend Quiz
              </Button>
              
              {/* View Leaderboard */}
              {(quiz.participantCount > 0 || quiz.participants?.length > 0) && (
                <Button onClick={handleViewLeaderboard} variant="outline" className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Leaderboard
                </Button>
              )}
            </CardContent>
          </Card>

          {/* QR Code / Questions Preview */}
          <Card className="shadow-xl bg-slate-800/50 backdrop-blur-md border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                {showQRCode ? "Scan to Join" : "Questions Preview"}
              </CardTitle>
            </CardHeader>

            <CardContent className="h-[350px] flex flex-col justify-between">
              {showQRCode ? (
                <div className="text-center space-y-4">
                  <QRCodeGenerator value={quizUrl} size={200} />
                  <p className="text-sm text-slate-400">
                    Participants can scan this QR code to join the quiz instantly
                  </p>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <code className="text-xs break-all text-slate-300">{quizUrl}</code>
                  </div>
                </div>
              ) : (
                <div className="space-y-4  " >
                  <div key={question.id} className="border-2 border-slate-700 rounded-lg p-4  h-[270px]">
                    <h4 className="font-semibold mb-2 text-white">
                      {currentQuestionIndex + 1}. {question.question}
                    </h4>
                    <div className="space-y-1">
                      {question.options.map((option: string, optIndex: number) => (
                        <div
                          key={optIndex}
                          className={`text-sm p-2 rounded ${optIndex === question.correctAnswer
                              ? "bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500/50"
                              : "bg-slate-900/50 text-slate-300"
                            }`}
                        >

                          {String.fromCharCode(65 + optIndex)}. {option}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentQuestionIndex === quiz.questions.length - 1}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              
          </CardContent>
        </Card>
      </div>
    </div>
    </div >
  );
};

export default QuizDisplay;