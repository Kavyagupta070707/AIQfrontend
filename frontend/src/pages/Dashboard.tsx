import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LineChart,
  ListChecks,
  NotebookPen,
  Pin,
  Plus,
  Sparkles,
  StickyNote,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FeatureCard from "@/components/study/FeatureCard";
import { Progress } from "@/components/ui/progress";
import { studyApi } from "@/lib/api";
import dashboardHeroImage from "@/assets/ChatGPT Image Aug 5, 2026, 11_13_51 AM.png";

const getRoadmapProgress = (roadmap: any) => {
  const steps = roadmap?.steps || [];
  if (!steps.length) return 0;
  return Math.round((steps.filter((step: any) => step.completed).length / steps.length) * 100);
};

const Dashboard = ({ user, onCreateQuiz, onNavigate }) => {
  const [data, setData] = useState({
    roadmaps: [],
    notes: [],
    shortNotes: [],
    stickyNotes: [],
    quizzes: [],
    results: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const dashboardData = await studyApi.getDashboardData(user._id);
        setData(dashboardData);
      } catch {
        setData({ roadmaps: [], notes: [], shortNotes: [], stickyNotes: [], quizzes: [], results: [] });
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) load();
  }, [user]);

  const avgScore = data.results.length
    ? Math.round(data.results.reduce((acc: number, r: any) => acc + (r.score / r.totalQuestions) * 100, 0) / data.results.length)
    : 0;
  const completedRoadmaps = data.roadmaps.filter((roadmap: any) => getRoadmapProgress(roadmap) === 100).length;

  return (
    <div className="space-y-6">
      <section className="aiq-panel overflow-hidden rounded-lg border">
        <div className="relative grid min-h-[280px] gap-6 bg-[radial-gradient(circle_at_28%_95%,color-mix(in_srgb,var(--theme-accent)_22%,transparent),transparent_35%)] px-6 py-8 sm:px-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-12">
          <div className="relative z-10 max-w-2xl">
            <h1 className="aiq-heading text-3xl font-semibold tracking-normal sm:text-4xl">
              Welcome back, {user?.username || "Student"}
            </h1>
            <p className="aiq-muted mt-4 max-w-2xl text-base leading-8">
              Plan your learning, generate notes, revise faster, and keep quizzes connected to your study goals.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => onNavigate("/roadmaps/create")} className="aiq-button-primary shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Roadmap
              </Button>
              <Button onClick={() => onNavigate("/notes")} variant="outline" className="aiq-button-soft">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Notes
              </Button>
            </div>
          </div>

          <div className="relative hidden min-h-[230px] overflow-hidden lg:block">
            <img
              src={dashboardHeroImage}
              alt="Study books and learning workspace"
              className="theme-dashboard-hero-image absolute -right-8 top-1/2 h-[350px] w-[760px] -translate-y-1/2 object-cover object-[50%_45%] opacity-95 mix-blend-screen"
            />
            <div className="theme-dashboard-forest-mark pointer-events-none absolute right-12 top-1/2 hidden h-56 w-[420px] -translate-y-1/2">
              <div className="absolute bottom-3 left-10 h-28 w-28 rounded-full bg-[color-mix(in_srgb,var(--theme-accent)_13%,transparent)] blur-2xl" />
              <svg viewBox="0 0 420 220" className="h-full w-full" aria-hidden="true">
                <path d="M72 168 C110 118 156 88 214 79 C272 70 327 88 374 132" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)]" />
                <path d="M126 169 C142 129 151 94 153 54" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" className="text-[color-mix(in_srgb,var(--theme-accent)_34%,transparent)]" />
                <path d="M153 98 C122 81 99 58 88 31 C120 33 145 54 153 98Z" fill="currentColor" className="text-[color-mix(in_srgb,var(--theme-accent)_18%,transparent)]" />
                <path d="M155 112 C190 93 224 72 248 39 C257 83 217 116 155 112Z" fill="currentColor" className="text-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]" />
                <path d="M154 143 C124 131 101 114 82 88 C114 82 143 103 154 143Z" fill="currentColor" className="text-[color-mix(in_srgb,var(--theme-accent)_16%,transparent)]" />
                <path d="M157 153 C197 139 231 118 264 88 C263 135 219 161 157 153Z" fill="currentColor" className="text-[color-mix(in_srgb,var(--theme-accent)_17%,transparent)]" />
                <circle cx="307" cy="66" r="4" fill="currentColor" className="text-[color-mix(in_srgb,var(--theme-accent)_22%,transparent)]" />
                <circle cx="333" cy="91" r="2.5" fill="currentColor" className="text-[color-mix(in_srgb,var(--theme-accent)_18%,transparent)]" />
                <circle cx="287" cy="117" r="3" fill="currentColor" className="text-[color-mix(in_srgb,var(--theme-accent)_16%,transparent)]" />
              </svg>
            </div>
            <div className="theme-dashboard-hero-fade pointer-events-none absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[var(--theme-surface)] to-transparent" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <FeatureCard icon={ListChecks} title="Roadmaps" description="Step-by-step study plans with progress tracking." value={data.roadmaps.length} tone="teal" onClick={() => onNavigate("/roadmaps")} />
        <FeatureCard icon={NotebookPen} title="Notes" description="Detailed AI notes for every topic." value={data.notes.length} tone="violet" onClick={() => onNavigate("/notes")} />
        <FeatureCard icon={FileText} title="Short Notes" description="Highlighted revision bullets." value={data.shortNotes.length} tone="blue" onClick={() => onNavigate("/short-notes")} />
        <FeatureCard icon={StickyNote} title="Sticky Notes" description="Quick reminders and doubts." value={data.stickyNotes.length} tone="orange" onClick={() => onNavigate("/sticky-notes")} />
        <FeatureCard icon={Trophy} title="Quizzes" description="Practice quizzes to test knowledge." value={data.quizzes.length} tone="amber" onClick={onCreateQuiz} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="aiq-card">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-500/15 text-teal-300 ring-1 ring-teal-400/20">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <h2 className="aiq-heading text-xl font-semibold">Active Roadmaps</h2>
              </div>
              <Button variant="outline" onClick={() => onNavigate("/roadmaps")} className="aiq-button-soft">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <p className="aiq-muted rounded-md border border-dashed border-[var(--theme-border)] p-8 text-center text-sm">Loading your workspace...</p>
              ) : data.roadmaps.length ? (
                data.roadmaps.slice(0, 3).map((roadmap: any, index: number) => {
                  const progress = getRoadmapProgress(roadmap);
                  const Icon = index % 2 === 0 ? Target : LineChart;

                  return (
                    <button
                      key={roadmap._id}
                      onClick={() => onNavigate(`/roadmaps/${roadmap._id}`)}
                      className="aiq-subcard w-full rounded-lg border p-4 text-left transition hover:border-[color-mix(in_srgb,var(--theme-accent)_35%,transparent)] hover:bg-[var(--theme-card-hover)]"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-300 ring-1 ring-teal-400/20">
                          <Icon className="h-7 w-7" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="aiq-heading font-semibold">{roadmap.title}</p>
                              <p className="aiq-muted mt-1 text-sm">{roadmap.subject || "General"}</p>
                            </div>
                            <span className="text-lg font-semibold text-teal-300">{progress}%</span>
                          </div>
                          <Progress value={progress} className="mt-4 h-2 bg-[color-mix(in_srgb,var(--theme-text)_10%,transparent)]" />
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--theme-border)] p-10 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-teal-300" />
                  <p className="aiq-muted mt-3 text-sm">Create your first roadmap and start studying with a clear path.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="aiq-card">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <h2 className="aiq-heading text-xl font-semibold">Study Snapshot</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="aiq-subcard rounded-lg border p-4">
                  <p className="aiq-muted text-sm">Quizzes Taken</p>
                  <p className="aiq-heading mt-2 text-3xl font-semibold">{data.results.length}</p>
                </div>
                <div className="aiq-subcard rounded-lg border p-4">
                  <p className="aiq-muted text-sm">Average Score</p>
                  <p className="aiq-heading mt-2 text-3xl font-semibold">{avgScore}%</p>
                </div>
                <div className="aiq-subcard rounded-lg border p-4 sm:col-span-2">
                  <p className="aiq-muted text-sm">Completed Roadmaps</p>
                  <p className="aiq-heading mt-2 text-3xl font-semibold">{completedRoadmaps}</p>
                </div>
              </div>
              <Button onClick={onCreateQuiz} variant="outline" className="aiq-button-soft mt-4 w-full">
                <Trophy className="mr-2 h-4 w-4" />
                Generate Practice Quiz
              </Button>
              <Button onClick={() => onNavigate("/attended-quizzes")} variant="outline" className="aiq-button-soft mt-3 w-full">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                View Attended Quizzes
              </Button>
            </CardContent>
          </Card>

          <Card className="aiq-card">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-500/15 text-orange-300 ring-1 ring-orange-400/20">
                    <Pin className="h-5 w-5" />
                  </span>
                  <h2 className="aiq-heading text-xl font-semibold">Pinned Reminders</h2>
                </div>
                <Button variant="outline" onClick={() => onNavigate("/sticky-notes")} className="aiq-button-soft">
                  View all
                </Button>
              </div>
              <div className="space-y-3">
                {data.stickyNotes.slice(0, 3).map((note: any) => (
                  <div key={note._id} className="rounded-lg border border-orange-400/25 bg-orange-500/12 p-4 text-sm text-[var(--theme-text)]">
                    <Pin className="mr-2 inline h-4 w-4 text-orange-500" />
                    {note.text}
                  </div>
                ))}
                {!data.stickyNotes.length && <p className="aiq-muted rounded-lg border border-dashed border-[var(--theme-border)] p-6 text-center text-sm">No reminders yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
