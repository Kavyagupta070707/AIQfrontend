import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  FileText,
  Lock,
  Map,
  MoreVertical,
  PlayCircle,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getRoadmapProgress } from "@/components/study/ProgressSummary";
import { studyApi } from "@/lib/api";

const previewSteps = [
  {
    day: 1,
    title: "Foundation",
    description: "Core notes, orientation, and first checks.",
    status: "current",
    side: "left",
  },
  {
    day: 2,
    title: "Core Concepts",
    description: "Active lesson with examples and practice.",
    status: "locked",
    side: "right",
  },
  {
    day: 3,
    title: "Practice Set",
    description: "Apply what you learned with questions.",
    status: "locked",
    side: "left",
  },
  {
    day: 4,
    title: "Final Review",
    description: "Review the path and complete a final check.",
    status: "locked",
    side: "right",
  },
];

const getCurrentStepIndex = (roadmap: any) => {
  const steps = roadmap?.steps || [];
  if (!steps.length) return -1;
  const index = steps.findIndex((step: any) => !step.completed);
  return index === -1 ? steps.length - 1 : index;
};

const getRoadmapStatus = (roadmap: any) => {
  const progress = getRoadmapProgress(roadmap);
  if (progress === 100) return "completed";
  return "active";
};

const getLastUpdated = (roadmap: any) => {
  const date = roadmap?.updatedAt || roadmap?.createdAt;
  if (!date) return "Recently updated";
  return `Updated ${new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
};

const RoadmapStatusBadge = ({ status }) => {
  const styles = {
    completed: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
    current: "border-violet-400/25 bg-violet-500/10 text-violet-300",
    upcoming: "border-blue-400/25 bg-blue-500/10 text-blue-300",
    locked: "border-[var(--theme-border)] bg-[var(--theme-subcard)] text-[var(--theme-muted)]",
  };

  const labels = {
    completed: "Completed",
    current: "Current",
    upcoming: "Upcoming",
    locked: "Locked",
  };

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const RoadmapPreview = () => (
  <aside
    aria-label="Example roadmap progression"
    className="aiq-panel-strong relative min-h-[560px] w-full max-w-[640px] overflow-hidden rounded-2xl border p-5"
  >
    <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(color-mix(in_srgb,var(--theme-accent)_16%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--theme-accent)_16%,transparent)_1px,transparent_1px)] [background-size:34px_34px]" />
    <div className="absolute left-1/2 top-20 h-[360px] -translate-x-1/2 border-l-2 border-dashed border-[color-mix(in_srgb,var(--theme-accent)_36%,transparent)]" />

    {previewSteps.map((step, index) => {
      const isCurrent = step.status === "current";
      const isLeft = step.side === "left";

      return (
        <div
          key={step.day}
          className="absolute left-6 right-6 grid grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] items-center justify-center gap-0"
          style={{ top: `${36 + index * 118}px` }}
        >
          <div className={isLeft ? "block" : "invisible"}>{isLeft && <PreviewLessonCard step={step} />}</div>
          <div className="relative flex justify-center">
            <span className={`absolute top-1/2 h-0 w-12 -translate-y-1/2 border-t-2 border-dashed border-[color-mix(in_srgb,var(--theme-accent)_36%,transparent)] ${isLeft ? "right-[74px]" : "left-[74px]"}`} />
            {isCurrent ? (
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-yellow-100/70 bg-rose-500 text-white shadow-lg shadow-rose-950/30">
                <span className="absolute -top-10 rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-bold text-slate-950">Next</span>
                <PlayCircle className="h-8 w-8" />
              </div>
            ) : (
              <div className="aiq-subcard flex h-14 w-14 items-center justify-center rounded-full border-[5px] text-[var(--theme-muted)] shadow-lg shadow-black/20">
                <Lock className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className={isLeft ? "invisible" : "block"}>{!isLeft && <PreviewLessonCard step={step} />}</div>
        </div>
      );
    })}

   
  </aside>
);

const PreviewLessonCard = ({ step }) => {
  const current = step.status === "current";

  return (
    <div className={`rounded-2xl border p-4 shadow-xl shadow-black/10 ${current ? "border-rose-400/35 bg-rose-500/20 text-[var(--theme-text)]" : "aiq-subcard"}`}>
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase ${current ? "bg-rose-500/12 text-rose-200" : "bg-[color-mix(in_srgb,var(--theme-text)_8%,transparent)] text-[var(--theme-muted)]"}`}>
        Day {step.day}
      </span>
      <h3 className={`mt-3 text-base font-semibold ${current ? "text-[var(--theme-text)]" : "aiq-heading"}`}>{step.title}</h3>
      <p className={`mt-2 text-xs leading-5 ${current ? "text-rose-50/85" : "aiq-muted"}`}>{step.description}</p>
    </div>
  );
};

const RoadmapStats = ({ activeCount, completedCount, totalSteps }) => {
  const items = [
    { label: "Active", value: activeCount, icon: Target, color: "text-teal-300 bg-teal-500/10 border-teal-400/20" },
    { label: "Completed", value: completedCount, icon: Trophy, color: "text-violet-300 bg-violet-500/10 border-violet-400/20" },
    { label: "Study days", value: totalSteps, icon: CalendarDays, color: "text-blue-300 bg-blue-500/10 border-blue-400/20" },
  ];

  return (
    <dl className="grid gap-4 border-t border-[var(--theme-border)] pt-6 sm:grid-cols-3">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="flex items-center gap-3">
          <dt className={`flex h-10 w-10 items-center justify-center rounded-lg border ${color}`}>
            <Icon className="h-4 w-4" />
          </dt>
          <dd>
            <p className="aiq-heading text-2xl font-semibold">{value}</p>
            <p className="aiq-muted text-sm">{label}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
};

const RoadmapsHeader = ({ latestRoadmap, activeCount, completedCount, totalSteps }) => (
  <section className="aiq-panel grid gap-8 rounded-2xl border p-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.76fr)] lg:items-center">
    <div>
      <div className="aiq-chip inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
        <Map className="h-4 w-4" />
        AIQ Roadmaps
      </div>
      <h1 className="aiq-heading mt-5 max-w-3xl text-4xl font-semibold leading-tight">
        Turn any subject into a guided study path.
      </h1>
      <p className="aiq-muted mt-4 max-w-2xl text-base leading-7">
        AIQ Study breaks a learning goal into daily lessons, practice, revision, and progress checkpoints so students always know what to do next.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="aiq-button-primary h-11 focus-visible:ring-2">
          <Link to="/roadmaps/create">
            <Plus className="mr-2 h-4 w-4" />
            New Roadmap
          </Link>
        </Button>
        {latestRoadmap && (
          <Button asChild variant="outline" className="aiq-button-soft h-11">
            <Link to={`/roadmaps/${latestRoadmap._id}`}>
              Continue Latest
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      <div className="mt-7">
        <RoadmapStats activeCount={activeCount} completedCount={completedCount} totalSteps={totalSteps} />
      </div>
    </div>
    <div className="flex justify-center lg:justify-end">
      <RoadmapPreview />
    </div>
  </section>
);

const RoadmapProgress = ({ value }) => (
  <div>
    <div className="mb-2 flex items-center justify-between text-xs">
      <span className="aiq-muted">Progress</span>
      <span className="aiq-accent font-medium">{value}%</span>
    </div>
    <Progress value={value} className="h-2 bg-[var(--theme-subcard)]" />
  </div>
);

const RoadmapCard = ({ roadmap, onDelete }) => {
  const progress = getRoadmapProgress(roadmap);
  const currentIndex = getCurrentStepIndex(roadmap);
  const currentStep = roadmap.steps?.[currentIndex];
  const completed = progress === 100;

  return (
    <article className="aiq-card aiq-card-hover group rounded-xl border p-4 transition duration-200 focus-within:border-[color-mix(in_srgb,var(--theme-accent)_45%,transparent)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-500/10 text-teal-300">
              <BookOpen className="h-4 w-4" />
            </span>
            <p className="aiq-muted truncate text-xs font-medium uppercase tracking-normal">{roadmap.subject || "General"}</p>
          </div>
          <Link to={`/roadmaps/${roadmap._id}`} className="aiq-heading mt-3 block rounded-md text-lg font-semibold outline-none transition hover:text-[var(--theme-accent)] focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]">
            {roadmap.title}
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" aria-label={`Open actions for ${roadmap.title}`} className="h-8 w-8 text-[var(--theme-muted)] hover:bg-[var(--theme-subcard)] hover:text-[var(--theme-text)]">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="aiq-panel-strong">
            <DropdownMenuItem onClick={() => onDelete(roadmap)} className="text-red-300 focus:bg-red-500/10 focus:text-red-200">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete roadmap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="aiq-muted mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-[var(--theme-muted)]" />
          {roadmap.steps?.length || 0} days
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[var(--theme-muted)]" />
          {getLastUpdated(roadmap)}
        </p>
      </div>

      <p className="aiq-muted mt-4 line-clamp-2 min-h-[48px] text-sm leading-6">
        {roadmap.overview || "Follow this path one day at a time with notes, practice, resources, and progress tracking."}
      </p>

      <div className="aiq-subcard mt-4 rounded-lg border p-3">
        <p className="aiq-muted text-xs font-medium uppercase tracking-normal">{completed ? "Status" : currentIndex >= 0 ? `Current lesson: Day ${currentIndex + 1}` : "Current lesson"}</p>
        <p className="aiq-heading mt-1 truncate text-sm font-medium">{completed ? "Roadmap completed" : currentStep?.title || "Ready to begin"}</p>
      </div>

      <div className="mt-4">
        <RoadmapProgress value={progress} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <RoadmapStatusBadge status={completed ? "completed" : "current"} />
        <Button asChild size="sm" className="aiq-button-primary focus-visible:ring-2">
          <Link to={`/roadmaps/${roadmap._id}`}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
};

const RoadmapFilters = ({ tab, setTab, query, setQuery, sort, setSort, counts }) => {
  const tabs = [
    { id: "active", label: "Active", count: counts.active },
    { id: "completed", label: "Completed", count: counts.completed },
    { id: "all", label: "All", count: counts.all },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Roadmap filters">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 ${
              tab === item.id ? "aiq-chip" : "aiq-subcard aiq-muted hover:bg-[var(--theme-card-hover)] hover:text-[var(--theme-text)]"
            }`}
          >
            {item.label}
            <span className="aiq-muted ml-2 text-xs">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-muted)]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search roadmaps..."
            className="aiq-input h-11 pl-9 focus-visible:ring-[var(--theme-accent)]"
            aria-label="Search roadmaps"
          />
        </label>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="aiq-input h-11 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
          aria-label="Sort roadmaps"
        >
          <option value="latest">Latest updated</option>
          <option value="progress">Highest progress</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>
    </div>
  );
};

const RoadmapEmptyState = ({ hasRoadmaps }) => (
  <div className="py-12 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-500/10 text-teal-300">
      <Map className="h-6 w-6" />
    </div>
    <h3 className="aiq-heading mt-4 text-lg font-semibold">{hasRoadmaps ? "No roadmaps match your filters" : "Create your first study roadmap"}</h3>
    <p className="aiq-muted mx-auto mt-2 max-w-md text-sm leading-6">
      {hasRoadmaps ? "Try a different search term or switch tabs." : "Turn a topic into daily lessons, notes, quizzes, and progress tracking."}
    </p>
    {!hasRoadmaps && (
      <Button asChild className="aiq-button-primary mt-5">
        <Link to="/roadmaps/create">
          <Plus className="mr-2 h-4 w-4" />
          Create Roadmap
        </Link>
      </Button>
    )}
  </div>
);

const FeatureItem = ({ icon: Icon, title, text, color }) => (
  <div className="aiq-card aiq-card-hover min-h-[150px] rounded-xl border p-5">
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${color}`}>
      <Icon className="h-4 w-4" />
    </span>
    <h3 className="aiq-heading mt-4 text-base font-semibold">{title}</h3>
    <p className="aiq-muted mt-2 text-sm leading-6">{text}</p>
  </div>
);

const RoadmapBenefits = () => (
  <section className="grid min-h-[360px] gap-8 py-10 lg:grid-cols-[0.52fr_1.48fr] lg:items-start">
    <div className="theme-readable-copy max-w-xl">
      <p className="aiq-accent text-sm font-semibold uppercase">What students get</p>
      <h2 className="aiq-heading mt-3 text-4xl font-semibold leading-tight">A complete guided workspace.</h2>
      <p className="aiq-muted mt-4 text-base leading-7">
        Each roadmap becomes a focused study area with structure, progress, notes, and practice built into the path.
      </p>
    </div>
    <div className="grid gap-5 md:grid-cols-2">
      <FeatureItem icon={Sparkles} title="AI-generated structure" text="A realistic sequence based on level, goal, duration, and study time." color="border-teal-400/20 bg-teal-500/10 text-teal-300" />
      <FeatureItem icon={FileText} title="Study inside the app" text="Notes, examples, practice questions, links, and PDF export in every day." color="border-blue-400/20 bg-blue-500/10 text-blue-300" />
      <FeatureItem icon={Lock} title="Sequential learning" text="Future days stay locked until the previous section is completed." color="border-violet-400/20 bg-violet-500/10 text-violet-300" />
      <FeatureItem icon={RotateCcw} title="Progress tracking" text="See completion, continue the latest path, and build study momentum." color="border-orange-400/20 bg-orange-500/10 text-orange-300" />
    </div>
  </section>
);

const RoadmapsPage = ({ user }) => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("active");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");

  const loadRoadmaps = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError("");
    try {
      const res = await studyApi.getRoadmaps(user._id);
      setRoadmaps(res.data);
    } catch {
      setError("Could not load roadmaps. Check your backend connection and try again.");
      setRoadmaps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmaps();
  }, [user]);

  const counts = useMemo(() => {
    const completed = roadmaps.filter((roadmap: any) => getRoadmapStatus(roadmap) === "completed").length;
    const active = roadmaps.length - completed;
    return { active, completed, all: roadmaps.length };
  }, [roadmaps]);

  const totalSteps = roadmaps.reduce((count: number, roadmap: any) => count + (roadmap.steps?.length || 0), 0);
  const latestRoadmap: any = roadmaps[0];

  const filteredRoadmaps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const next = roadmaps
      .filter((roadmap: any) => tab === "all" || getRoadmapStatus(roadmap) === tab)
      .filter((roadmap: any) => {
        if (!normalizedQuery) return true;
        return [roadmap.title, roadmap.subject, roadmap.overview, roadmap.goal].some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
      });

    return [...next].sort((a: any, b: any) => {
      if (sort === "progress") return getRoadmapProgress(b) - getRoadmapProgress(a);
      if (sort === "title") return String(a.title || "").localeCompare(String(b.title || ""));
      return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
    });
  }, [roadmaps, query, sort, tab]);

  const deleteRoadmap = async (roadmap: any) => {
    const confirmed = window.confirm(`Delete "${roadmap.title}"?`);
    if (!confirmed) return;

    try {
      await studyApi.deleteRoadmap(roadmap._id);
      setRoadmaps((items) => items.filter((item: any) => item._id !== roadmap._id));
      toast.success("Roadmap deleted");
    } catch {
      toast.error("Could not delete roadmap");
    }
  };

  return (
    <main className="space-y-12">
      <RoadmapsHeader latestRoadmap={latestRoadmap} activeCount={counts.active} completedCount={counts.completed} totalSteps={totalSteps} />

      <RoadmapBenefits />

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="theme-readable-copy">
            <h2 className="aiq-heading text-3xl font-semibold">Your Roadmaps</h2>
            <p className="aiq-muted mt-1 text-sm">Scan, filter, continue, or remove learning paths.</p>
          </div>
          <Button asChild variant="outline" className="aiq-button-soft">
            <Link to="/roadmaps/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Roadmap
            </Link>
          </Button>
        </div>

        <RoadmapFilters tab={tab} setTab={setTab} query={query} setQuery={setQuery} sort={sort} setSort={setSort} counts={counts} />

        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
            <Button type="button" variant="ghost" onClick={loadRoadmaps} className="ml-2 h-auto p-0 text-red-100 underline hover:bg-transparent hover:text-red-200">
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="aiq-card h-64 animate-pulse rounded-xl border" />
            ))}
          </div>
        ) : filteredRoadmaps.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredRoadmaps.map((roadmap: any) => (
              <RoadmapCard key={roadmap._id} roadmap={roadmap} onDelete={deleteRoadmap} />
            ))}
          </div>
        ) : (
          <RoadmapEmptyState hasRoadmaps={roadmaps.length > 0} />
        )}
      </section>
    </main>
  );
};

export default RoadmapsPage;
