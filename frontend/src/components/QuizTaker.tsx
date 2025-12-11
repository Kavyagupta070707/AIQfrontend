import axios from "axios";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Users, LogIn, UserPlus } from "lucide-react";
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
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl bg-slate-800/50 backdrop-blur-md border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold mb-2 text-white">
                Sign In to Continue
              </CardTitle>
              <p className="text-slate-400 text-sm">
                Login to take the quiz and save your results
              </p>
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="mt-4 text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </CardHeader>
            <CardContent>
              <LoginPage 
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl bg-slate-800/50 backdrop-blur-md border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold mb-2 text-white">
                Create Account
              </CardTitle>
              <p className="text-slate-400 text-sm">
                Sign up to take the quiz and track your progress
              </p>
              <Button 
                variant="ghost" 
                onClick={() => setShowAuth("login")}
                className="mt-4 text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </CardHeader>
            <CardContent>
              <SignupPage 
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="w-full max-w-3xl px-4 flex flex-col items-center justify-center">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-8 self-start text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="shadow-xl bg-slate-800/50 backdrop-blur-md border-slate-700 w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white">
                Quiz: {quiz.topic}
              </CardTitle>
              <p className="text-slate-400">
                {quiz.questions.length} questions • Multiple choice
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="playerName" className="text-base font-medium text-slate-300">
                  Your Name {isLoggedIn && <span className="text-emerald-400">(Logged in ✓)</span>}
                </Label>
                <Input
                  id="playerName"
                  placeholder="Enter your name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-lg py-3 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoggedIn}
                />
              </div>
              <Button 
                onClick={startQuiz}
                size="lg"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold"
              >
                Start Quiz
              </Button>
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-white">
                  <Users className="w-4 h-4" />
                  Quiz Info
                </h4>
                <ul className="text-sm text-slate-400 space-y-1">
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="w-full max-w-5xl px-4 flex flex-row items-center justify-center py-8 gap-8">
        {/* Circular Progress Section */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/4 max-w-[140px] h-full">
          <div className="mb-4 text-base font-semibold text-cyan-400 text-center truncate max-w-[120px]">
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
          <div className="mt-4 text-sm font-medium text-slate-400 text-center">
            Progress
          </div>
        </div>
        {/* Quiz Card Section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <Card className="shadow-xl bg-slate-800/50 backdrop-blur-md border-slate-700 w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Answer Options */}
              <div className="space-y-3">
                {question.options.map((option: string, index: number) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className={`w-full justify-start p-6 h-auto text-left ${
                      selectedAnswer === index 
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 border-cyan-400 font-semibold' 
                        : 'border-slate-600 bg-slate-900/50 text-white hover:bg-slate-700 hover:border-slate-500'
                    }`}
                    onClick={() => selectAnswer(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        selectedAnswer === index ? 'bg-slate-900 text-cyan-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-base">{option}</span>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="pt-6 flex gap-4">
                <Button 
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  size="lg"
                  className="w-1/2 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Previous
                </Button>
                <Button 
                  onClick={nextQuestion}
                  disabled={selectedAnswer === null}
                  size="lg"
                  className="w-1/2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold"
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