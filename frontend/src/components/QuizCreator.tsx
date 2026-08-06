import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { studyApi } from "@/lib/api";

interface QuizCreatorProps {
  onBack: () => void;
  onQuizGenerated: (quiz: any) => void;
}

const QuizCreator = ({ onBack, onQuizGenerated }: QuizCreatorProps) => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuiz = async (e: any) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error("Please enter a topic for your quiz");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const createdBy = user?._id || user?.id;
    if (!createdBy) {
      toast.error("Please log in again before creating a quiz");
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await studyApi.generateQuiz(topic);
      const quizData = generated.data;

      if (!quizData.questions || quizData.questions.length !== 10) {
        toast.error("Sorry, the quiz format was invalid. Please try another topic.");
        return;
      }

      const quiz = {
        topic,
        questions: quizData.questions.map((q: any, index: number) => ({
          id: index + 1,
          question: q.question,
          options: q.options,
          correctAnswer: Number(q.correctAnswer),
        })),
        createdAt: new Date().toISOString(),
        participants: [],
        createdBy,
      };

      const saved = await studyApi.saveQuiz(quiz);
      toast.success("Quiz generated successfully");
      onQuizGenerated(saved.data);
      navigate("/quiz");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to generate quiz. Check GROQ_API_KEY on the backend.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-96px)] w-full items-center justify-center">
      <div className="w-full max-w-2xl">
        <Button variant="ghost" onClick={onBack} className="aiq-muted mb-6 hover:bg-[var(--theme-subcard)] hover:text-[var(--theme-text)]">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="aiq-card">
          <CardHeader>
            <CardTitle className="aiq-heading text-2xl font-semibold">Create Practice Quiz</CardTitle>
            <p className="aiq-muted text-sm">Enter any topic and the backend will generate a factual quiz using Groq.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={generateQuiz} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="topic" className="aiq-heading">Quiz topic</Label>
                <Input
                  id="topic"
                  placeholder="Machine learning, Roman history, Newton's laws..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                  className="aiq-input"
                />
              </div>

              <Button disabled={isGenerating || !topic.trim()} className="aiq-button-primary w-full">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate AI Quiz
              </Button>

              <div className="aiq-subcard rounded-lg border p-4 text-sm">
                <p className="aiq-heading font-medium">What you get</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>10 multiple-choice questions</li>
                  <li>Shareable quiz and leaderboard flow</li>
                </ul>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizCreator;
