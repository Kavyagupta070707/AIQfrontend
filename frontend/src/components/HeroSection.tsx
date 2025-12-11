import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, QrCode, Users, Trophy, Sparkles, Zap, Target, ArrowRight, CheckCircle, Star } from "lucide-react";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";

const HeroSection = ({ onLogin, onSignup, onLoginSuccess }: { onLogin: () => void, onSignup: () => void, onLoginSuccess: (token: string, userObj: any) => void }) => {
  const [showAuth, setShowAuth] = useState<"login" | "signup" | null>(null);
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden font-inter">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 backdrop-blur-md rounded-full px-5 py-2 mb-6 border border-cyan-400/20">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 font-medium text-sm">AI-Powered Quiz Generation</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-5 tracking-tight">
            Create & Share
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Interactive Quizzes
            </span>
            <br />
            Instantly
          </h1>
          
          <p className="text-base lg:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform any topic into engaging quizzes with AI. Generate QR codes for instant sharing 
            and watch real-time leaderboards unfold as participants compete.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={() => setShowAuth("login")}
              className="bg-cyan-500 text-slate-900 hover:bg-cyan-400 text-base px-6 py-5 rounded-lg shadow-xl transform hover:scale-105 transition-all font-medium"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setShowAuth("signup")}
              className="bg-transparent text-cyan-300 border-2 border-cyan-400/40 hover:bg-cyan-400/10 text-base px-6 py-5 rounded-lg font-medium"
            >
              Sign Up Now
            </Button>
          </div>
        </div>

        {/* Auth Modals */}
        {showAuth === "login" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-800/95 backdrop-blur-md border-2 border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-300">
              <button 
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold"
                onClick={() => setShowAuth(null)}
              >
                &times;
              </button>
              <LoginPage 
                onSignupRedirect={() => setShowAuth("signup")}
                onLoginSuccess={(token, userObj) => {
                  setShowAuth(null);
                  onLoginSuccess(token, userObj);
                }}
              />
            </div>
          </div>
        )}
        {showAuth === "signup" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-800/95 backdrop-blur-md border-2 border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-300">
              <button 
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold"
                onClick={() => setShowAuth(null)}
              >
                &times;
              </button>
              <SignupPage onLoginRedirect={() => setShowAuth("login")} />
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-xl p-6 hover:transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">QR Code Sharing</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Generate instant QR codes for your quizzes. Share with anyone, anywhere - no app downloads required.
            </p>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-xl p-6 hover:transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Real-time Participation</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Watch as participants join and complete your quiz in real-time with live tracking and analytics.
            </p>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-xl p-6 hover:transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Live Leaderboard</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Gamify learning with live leaderboards that update instantly as participants submit answers.
            </p>
          </Card>
        </div>

        {/* Interactive Quiz Preview */}
        <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 mb-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-5">
                How It Works
              </h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="bg-cyan-500/20 rounded-full p-2.5 mt-1">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white mb-1.5">1. Enter Your Topic</h4>
                    <p className="text-slate-400 text-sm">Simply type in any subject and let our AI do the magic.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 rounded-full p-2.5 mt-1">
                    <Brain className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white mb-1.5">2. AI Generates Questions</h4>
                    <p className="text-slate-400 text-sm">Get 10 high-quality multiple-choice questions in seconds.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-500/20 rounded-full p-2.5 mt-1">
                    <Target className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white mb-1.5">3. Share & Track</h4>
                    <p className="text-slate-400 text-sm">Share via QR code or link and watch the leaderboard fill up!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-600/50">
              <div className="bg-slate-900 rounded-lg p-5 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  What is the standard number of players in a cricket team?
                </h3>
                <div className="space-y-2">
                  {['9', '10', '11', '12'].map((option, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        i === 2 
                          ? 'border-cyan-500 bg-cyan-500/20' 
                          : 'border-slate-700 hover:border-cyan-400/50 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">{String.fromCharCode(65 + i)}. {option}</span>
                        {i === 2 && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Star, value: "10", label: "Questions Per Quiz" },
            { icon: Zap, value: "< 30s", label: "Generation Time" },
            { icon: Users, value: "∞", label: "Participants" },
            { icon: Trophy, value: "100%", label: "Free Forever" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-5 border border-slate-700/50">
                <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 font-medium text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-slate-800/40 backdrop-blur-md rounded-2xl p-10 border border-slate-700/50">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-base text-slate-300 mb-6 max-w-xl mx-auto">
            Join thousands of educators and quiz enthusiasts creating engaging content with AI
          </p>
          <Button 
            size="lg" 
            onClick={() => setShowAuth("login")}
            className="bg-cyan-500 text-slate-900 hover:bg-cyan-400 text-base px-8 py-5 rounded-lg shadow-xl transform hover:scale-105 transition-all font-medium"
          >
            Start Creating Quizzes
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;