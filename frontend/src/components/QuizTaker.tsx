import axios from "axios";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";

interface QuizTakerProps {
  quiz: any;
  onBack: () => void;
  onComplete: (results: any) => void;
}

const QuizTaker =  ({ quiz, onBack, onComplete }: QuizTakerProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]); // allow null for unanswered
  const [playerName, setPlayerName] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState<"login" | "signup" | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userObj = JSON.parse(user);
        setIsLoggedIn(true);
        setPlayerName(userObj.username || "");
      } catch (e) {
        setIsLoggedIn(false);
        setShowAuth("login"); // Automatically show login if not logged in
      }
    } else {
      // User not logged in, show login popup immediately
      setShowAuth("login");
    }
  }, []);

  if (!quiz) {
    return <div className="flex items-center justify-center min-h-screen">Loading quiz...</div>;
  }

  // selectedAnswer is derived from answers[currentQuestion]
  const selectedAnswer = answers[currentQuestion] ?? null;

  const startQuiz = () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name to start");
      return;
    }
    // Initialize answers array with nulls
    setAnswers(Array(quiz.questions.length).fill(null));
    setCurrentQuestion(0);
    setHasStarted(true);
    toast.success(`Welcome ${playerName}! Let's begin!`);
  };

  const selectAnswer = (answerIndex: number) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestion] = answerIndex;
      return updated;
    });
  };

  const nextQuestion = async () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer");
      return;
    }
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed
      const score = answers.reduce((total, answer, index) => {
        return total + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
      }, 0);
      const results = {
        playerName,
        score,
        totalQuestions: quiz.questions.length,
        answers,
        completedAt: new Date().toISOString()
      };
      try {
        // Get userId from localStorage (required since user must be logged in)
        const userStr = localStorage.getItem('user');
        console.log("User from localStorage:", userStr);
        
        if (!userStr) {
          toast.error("Session expired. Please login again.");
          setIsLoggedIn(false);
          setShowAuth("login");
          return;
        }
        
        let userId;
        try {
          const userObj = JSON.parse(userStr);
          userId = userObj._id || userObj.id;
          console.log("Parsed user object:", userObj);
          console.log("Extracted userId:", userId);
        } catch (parseErr) {
          console.error("Error parsing user data:", parseErr);
          toast.error("Invalid session data. Please login again.");
          setIsLoggedIn(false);
          setShowAuth("login");
          return;
        }
        
        if (!userId) {
          toast.error("User ID not found. Please login again.");
          setIsLoggedIn(false);
          setShowAuth("login");
          return;
        }

        const submitData = {
          quizId: quiz._id,
          playerName,
          userId: userId,
          topic: quiz.topic,
          score,
          totalQuestions: quiz.questions.length,
          answers,
          completedAt: new Date().toISOString()
        };
        
        console.log("Submitting quiz data:", submitData);

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        await axios.post(`${BACKEND_URL}/api/quiz/${quiz._id}/submit`, submitData);
        toast.success(`Quiz completed! You scored ${score}/${quiz.questions.length}`);
        onComplete(results);
      } catch (err: any) {
        console.error("Error submitting quiz:", err);
        if (err.response && err.response.data && err.response.data.error) {
          toast.error(`Failed to submit results: ${err.response.data.error}`);
        } else {
          toast.error("Failed to submit results to backend");
        }
      }
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  // Auth modals - show directly if not logged in
  if (showAuth === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-[var(--theme-text)]">
        <div className="w-full max-w-md">
          <Card className="aiq-card">
            <CardHeader className="text-center">
              <CardTitle className="aiq-heading mb-2 text-2xl font-bold">
                Sign In to Continue
              </CardTitle>
              <p className="aiq-muted text-sm">
                Login to take the quiz and save your results
              </p>
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="aiq-muted mt-4 hover:bg-[var(--theme-subcard)] hover:text-[var(--theme-text)]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </CardHeader>
            <CardContent>
              <LoginPage 
                embedded
                onSignupRedirect={() => setShowAuth("signup")}
                onLoginSuccess={(token, userObj) => {
                  // Save to localStorage
                  localStorage.setItem('authToken', token);
                  localStorage.setItem('user', JSON.stringify(userObj));
                  console.log("User saved to localStorage:", userObj);
                  
                  setIsLoggedIn(true);
                  setPlayerName(userObj.username);
                  setShowAuth(null);
                  toast.success(`Welcome back, ${userObj.username}!`);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showAuth === "signup") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-[var(--theme-text)]">
        <div className="w-full max-w-md">
          <Card className="aiq-card">
            <CardHeader className="text-center">
              <CardTitle className="aiq-heading mb-2 text-2xl font-bold">
                Create Account
              </CardTitle>
              <p className="aiq-muted text-sm">
                Sign up to take the quiz and track your progress
              </p>
              <Button 
                variant="ghost" 
                onClick={() => setShowAuth("login")}
                className="aiq-muted mt-4 hover:bg-[var(--theme-subcard)] hover:text-[var(--theme-text)]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </CardHeader>
            <CardContent>
              <SignupPage 
                embedded
                onLoginRedirect={() => setShowAuth("login")}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-3 py-6 text-[var(--theme-text)] sm:px-4">
        <div className="flex w-full max-w-3xl flex-col items-center justify-center">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="aiq-muted mb-4 self-start hover:bg-[var(--theme-subcard)] hover:text-[var(--theme-text)] sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="aiq-card w-full">
            <CardHeader className="text-center">
              <CardTitle className="aiq-heading text-2xl font-bold leading-tight sm:text-3xl">
                Quiz: {quiz.topic}
              </CardTitle>
              <p className="aiq-muted">
                {quiz.questions.length} questions • Multiple choice
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="playerName" className="aiq-heading text-base font-medium">
                  Your Name {isLoggedIn && <span className="text-emerald-400">(Logged in ✓)</span>}
                </Label>
                <Input
                  id="playerName"
                  placeholder="Enter your name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="aiq-input py-3 text-lg"
                  disabled={isLoggedIn}
                />
              </div>
              <Button 
                onClick={startQuiz}
                size="lg"
                className="aiq-button-primary w-full font-semibold"
              >
                Start Quiz
              </Button>
              <div className="aiq-subcard space-y-2 rounded-lg p-4">
                <h4 className="aiq-heading flex items-center gap-2 text-sm font-semibold">
                  <Users className="w-4 h-4" />
                  Quiz Info
                </h4>
                <ul className="aiq-muted space-y-1 text-sm">
                  <li>• {quiz.questions.length} multiple choice questions</li>
                  <li>• Each question has 4 possible answers</li>
                  <li>• Take your time, no time limit</li>
                  <li>• Results will be shown at the end</li>
                  {isLoggedIn && <li className="text-emerald-400 font-medium">• ✓ Your results will be saved to your account</li>}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="flex min-h-screen w-full items-start justify-center px-3 py-5 text-[var(--theme-text)] sm:px-4 md:items-center md:py-8">
      <div className="flex w-full max-w-5xl flex-col items-stretch justify-center gap-4 md:flex-row md:items-center md:gap-8">
        <div className="aiq-card rounded-lg border p-4 md:hidden">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--theme-accent)]">{playerName}</p>
              <p className="aiq-muted text-xs">Question {currentQuestion + 1} of {quiz.questions.length}</p>
            </div>
            <span className="aiq-chip rounded-md border px-2.5 py-1 text-xs font-semibold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-[color-mix(in_srgb,var(--theme-text)_10%,transparent)]" />
        </div>

        {/* Circular Progress Section */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/4 max-w-[140px] h-full">
          <div className="mb-4 max-w-[120px] truncate text-center text-base font-semibold text-[var(--theme-accent)]">
            {playerName}
          </div>
          <div style={{ width: 100, height: 100 }}>
            <CircularProgressbar
              value={progress}
              text={`${currentQuestion + 1}/${quiz.questions.length}`}
              styles={buildStyles({
                textColor: '#22d3ee',
                pathColor: '#22d3ee',
                trailColor: '#334155',
                textSize: '1.1rem',
                strokeLinecap: 'round',
              })}
            />
          </div>
          <div className="aiq-muted mt-4 text-center text-sm font-medium">
            Progress
          </div>
        </div>
        {/* Quiz Card Section */}
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
          <Card className="aiq-card w-full">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="aiq-heading text-xl font-bold leading-7 sm:text-2xl sm:leading-8">
                {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
              {/* Answer Options */}
              <div className="space-y-3">
                {question.options.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className={`min-h-[64px] w-full justify-start whitespace-normal px-3 py-4 text-left sm:px-6 sm:py-5 ${
                      selectedAnswer === index 
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 border-cyan-400 font-semibold' 
                        : 'aiq-subcard hover:bg-[var(--theme-card-hover)]'
                    }`}
                    onClick={() => selectAnswer(index)}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                        selectedAnswer === index ? 'bg-[var(--theme-card)] text-[var(--theme-accent)]' : 'bg-[color-mix(in_srgb,var(--theme-text)_10%,transparent)] text-[var(--theme-muted)]'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="min-w-0 flex-1 break-words text-sm leading-6 sm:text-base">{option}</span>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4 sm:pt-6">
                <Button 
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  size="lg"
                  className="aiq-button-soft h-11 w-full sm:h-12 sm:w-1/2"
                >
                  Previous
                </Button>
                <Button 
                  onClick={nextQuestion}
                  disabled={selectedAnswer === null}
                  size="lg"
                  className="aiq-button-primary h-11 w-full font-semibold sm:h-12 sm:w-1/2"
                >
                  {currentQuestion < quiz.questions.length - 1 ? "Next" : "Finish Quiz"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default QuizTaker;
