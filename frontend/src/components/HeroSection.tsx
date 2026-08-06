import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  Layers3,
  NotebookPen,
  Plus,
  Sparkles,
  StickyNote,
  Trophy,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import mountainNight from "@/assets/theme-mountain-night.png";

const productFeatures = [
  {
    icon: ClipboardList,
    title: "AI roadmaps",
    text: "Turn any topic into a day-by-day learning path with locked steps, progress, and a clear next action.",
  },
  {
    icon: NotebookPen,
    title: "Structured notes",
    text: "Create, save, search, and organize long-form notes by subject so study material stays in one place.",
  },
  {
    icon: FileText,
    title: "Short notes",
    text: "Convert full notes into revision bullets that are easier to review before practice or exams.",
  },
  {
    icon: Trophy,
    title: "Practice quizzes",
    text: "Generate quizzes from topics or roadmap lessons, then track scores and leaderboard performance.",
  },
];

const workflow = [
  "Choose a subject, goal, and study duration.",
  "AIQ builds a calm guided path with daily work.",
  "Study inside the app with notes, reminders, and quizzes.",
  "Return to the latest step and keep momentum visible.",
];

const HeroSection = ({
  onLoginSuccess,
}: {
  onLogin: () => void;
  onSignup: () => void;
  onLoginSuccess: (token: string, userObj: any) => void;
}) => {
  const [showAuth, setShowAuth] = useState<"login" | "signup" | null>(null);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--theme-page)] text-[var(--theme-text)]">
      <img src={mountainNight} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[var(--theme-world-opacity)]" />
      <div className="theme-world-veil absolute inset-0 bg-[var(--theme-world-overlay)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--theme-accent)] text-white shadow-lg shadow-black/15">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-bold">AIQ Study</p>
              <p className="aiq-muted text-xs">Calm AI study workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => setShowAuth("login")} className="aiq-button-soft h-10">
              Log in
            </Button>
            <Button type="button" onClick={() => setShowAuth("signup")} className="aiq-button-primary h-10">
              Sign up
            </Button>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <div className="aiq-chip inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold">
              <Sparkles className="mr-2 h-4 w-4" />
              Roadmaps, notes, reminders, and quizzes in one flow
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-bold leading-tight tracking-normal sm:text-6xl lg:text-7xl">
              Enter a calmer world for serious study.
            </h1>
            <p className="aiq-muted mt-6 max-w-2xl text-lg leading-8">
              AIQ Study helps students move from a rough goal to a guided workspace: generate learning roadmaps, write notes,
              compress revision material, keep sticky doubts, and practice with quizzes without losing the thread.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button type="button" onClick={() => setShowAuth("signup")} className="aiq-button-primary h-12 px-6 text-base">
                Start studying
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAuth("login")} className="aiq-button-soft h-12 px-6 text-base">
                Continue workspace
              </Button>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
              {workflow.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-lg bg-[color-mix(in_srgb,var(--theme-card)_72%,transparent)] p-3 backdrop-blur-md">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--theme-accent)]" />
                  <p className="text-sm leading-6">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="aiq-panel-strong rounded-xl border p-5">
            <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
              <div>
                <p className="aiq-accent text-xs font-semibold uppercase">Today inside AIQ</p>
                <h2 className="mt-1 text-2xl font-bold">Graph in DSA</h2>
              </div>
              <span className="aiq-chip rounded-full border px-3 py-1 text-sm font-semibold">Day 2</span>
            </div>

            <div className="mt-5 space-y-4">
              <div className="aiq-subcard rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Layers3 className="h-5 w-5 text-[var(--theme-accent)]" />
                    <div>
                      <p className="font-semibold">Core Concepts</p>
                      <p className="aiq-muted text-sm">Traversal, BFS, DFS, and complexity notes.</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[var(--theme-accent)]">Current</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: NotebookPen, label: "Notes", value: "Saved draft" },
                  { icon: StickyNote, label: "Sticky", value: "2 doubts" },
                  { icon: BarChart3, label: "Progress", value: "33%" },
                  { icon: Trophy, label: "Quiz", value: "Ready" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="aiq-card rounded-lg border p-4">
                    <Icon className="h-5 w-5 text-[var(--theme-accent)]" />
                    <p className="mt-4 text-sm font-semibold">{label}</p>
                    <p className="aiq-muted mt-1 text-sm">{value}</p>
                  </div>
                ))}
              </div>

              <Button type="button" onClick={() => setShowAuth("signup")} className="aiq-button-primary h-12 w-full">
                <Plus className="mr-2 h-5 w-5" />
                Create my first roadmap
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-14 md:grid-cols-2 xl:grid-cols-4">
          {productFeatures.map(({ icon: Icon, title, text }) => (
            <article key={title} className="aiq-card rounded-xl border p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--theme-accent)_16%,transparent)] text-[var(--theme-accent)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="aiq-muted mt-3 text-sm leading-6">{text}</p>
            </article>
          ))}
        </section>
      </div>

      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-md">
          <div className="relative w-full max-w-md">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowAuth(null)}
              className="absolute -right-2 -top-12 h-10 w-10 rounded-full text-slate-200 hover:bg-white/10 hover:text-white"
              aria-label="Close sign in dialog"
            >
              <X className="h-5 w-5" />
            </Button>
            {showAuth === "login" ? (
              <LoginPage
                embedded
                onSignupRedirect={() => setShowAuth("signup")}
                onLoginSuccess={(token, userObj) => {
                  setShowAuth(null);
                  onLoginSuccess(token, userObj);
                }}
              />
            ) : (
              <SignupPage embedded onLoginRedirect={() => setShowAuth("login")} />
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default HeroSection;
