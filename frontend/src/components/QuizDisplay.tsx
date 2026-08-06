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
    <div className="py-8 text-[var(--theme-text)]">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="aiq-muted mb-8 hover:bg-[var(--theme-subcard)] hover:text-[var(--theme-text)]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Create Another Quiz
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quiz Info */}
          <Card className="aiq-card">
            <CardHeader>
              <CardTitle className="aiq-heading text-2xl font-bold">
                Quiz Generated Successfully!
              </CardTitle>
              <p className="aiq-muted">
                Your quiz about <span className="font-semibold text-[var(--theme-accent)]">{quiz.topic}</span> is ready to share
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Quiz Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="aiq-subcard rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--theme-accent)]">{quiz.questions.length}</div>
                  <div className="aiq-muted text-sm">Questions</div>
                </div>
                <div className="aiq-subcard rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--theme-accent)]">{quiz.participantCount || quiz.participants?.length || 0}</div>
                  <div className="aiq-muted text-sm">Participants</div>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-3">
                <Button
                  onClick={() => setShowQRCode(!showQRCode)}
                  variant="outline"
                  className="aiq-button-soft w-full"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {showQRCode ? "Hide QR Code" : "Show QR Code"}
                </Button>

                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" className="aiq-button-soft flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button onClick={shareQuiz} variant="outline" className="aiq-button-soft flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Start Quiz */}
              <Button onClick={handleStartQuiz} className="aiq-button-primary w-full">
                <Users className="w-4 h-4 mr-2" />
                Attend Quiz
              </Button>
              
              {/* View Leaderboard */}
              {(quiz.participantCount > 0 || quiz.participants?.length > 0) && (
                <Button onClick={handleViewLeaderboard} variant="outline" className="w-full border-yellow-500/50 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/15">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Leaderboard
                </Button>
              )}
            </CardContent>
          </Card>

          {/* QR Code / Questions Preview */}
          <Card className="aiq-card">
            <CardHeader>
              <CardTitle className="aiq-heading text-xl">
                {showQRCode ? "Scan to Join" : "Questions Preview"}
              </CardTitle>
            </CardHeader>

            <CardContent className="h-[350px] flex flex-col justify-between">
              {showQRCode ? (
                <div className="text-center space-y-4">
                  <QRCodeGenerator value={quizUrl} size={200} />
                  <p className="aiq-muted text-sm">
                    Participants can scan this QR code to join the quiz instantly
                  </p>
                  <div className="aiq-subcard rounded-lg p-3">
                    <code className="text-xs break-all text-[var(--theme-text)]">{quizUrl}</code>
                  </div>
                </div>
              ) : (
                <div className="space-y-4  " >
                  <div key={question.id} className="rounded-lg border-2 border-[var(--theme-border)] p-4 h-[270px]">
                    <h4 className="aiq-heading mb-2 font-semibold">
                      {currentQuestionIndex + 1}. {question.question}
                    </h4>
                    <div className="space-y-1">
                      {question.options.map((option: string, optIndex: number) => (
                        <div
                          key={optIndex}
                          className={`text-sm p-2 rounded ${optIndex === question.correctAnswer
                              ? "bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500/50"
                            : "aiq-subcard aiq-muted"
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
                      className="aiq-button-primary rounded px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentQuestionIndex === quiz.questions.length - 1}
                      className="aiq-button-primary rounded px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
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
