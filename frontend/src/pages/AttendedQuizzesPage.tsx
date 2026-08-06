import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, ClipboardCheck, Search, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/study/PageHeader";
import { studyApi } from "@/lib/api";

const getQuizId = (result: any) => {
  const quiz = result.quizId;
  return typeof quiz === "object" ? quiz?._id : quiz;
};

const getQuizTitle = (result: any) => {
  const quiz = result.quizId;
  return result.topic || (typeof quiz === "object" ? quiz?.topic : "") || "Untitled quiz";
};

const getPercentage = (result: any) => {
  if (!result.totalQuestions) return 0;
  return Math.round((result.score / result.totalQuestions) * 100);
};

const AttendedQuizzesPage = ({ user }) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        const res = await studyApi.getResults(user._id);
        setResults(res.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filteredResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...results]
      .filter((result) => !normalized || getQuizTitle(result).toLowerCase().includes(normalized))
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
  }, [query, results]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attended Quizzes"
        description="Review every quiz you have completed, reopen detailed answers, and check leaderboard rankings."
      />

      <section className="aiq-panel rounded-xl border p-5">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-muted)]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search attended quizzes..."
            className="aiq-input h-11 pl-9"
            aria-label="Search attended quizzes"
          />
        </label>
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="aiq-card h-40 animate-pulse rounded-xl border" />
          ))}
        </div>
      ) : filteredResults.length ? (
        <section className="grid gap-4 md:grid-cols-2">
          {filteredResults.map((result) => {
            const quizId = getQuizId(result);
            const percentage = getPercentage(result);

            return (
              <article key={result._id} className="aiq-card aiq-card-hover rounded-xl border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-500/10 text-teal-300">
                        <ClipboardCheck className="h-4 w-4" />
                      </span>
                      <p className="aiq-muted text-xs font-semibold uppercase">Completed Quiz</p>
                    </div>
                    <h2 className="aiq-heading mt-3 truncate text-lg font-semibold">{getQuizTitle(result)}</h2>
                    <p className="aiq-muted mt-2 flex items-center gap-2 text-sm">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(result.completedAt || Date.now()).toLocaleString()}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-lg bg-[color-mix(in_srgb,var(--theme-accent)_13%,transparent)] px-3 py-2 text-right">
                    <p className="aiq-heading text-xl font-bold">{percentage}%</p>
                    <p className="aiq-muted text-xs">{result.score}/{result.totalQuestions}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild className="aiq-button-primary">
                    <Link to={`/results/${result._id}`}>
                      View Answers
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {quizId && (
                    <Button asChild variant="outline" className="aiq-button-soft">
                      <Link to={`/quiz/${quizId}/leaderboard`}>
                        <Trophy className="mr-2 h-4 w-4" />
                        Leaderboard
                      </Link>
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="aiq-card rounded-xl border border-dashed p-10 text-center">
          <ClipboardCheck className="mx-auto h-10 w-10 text-[var(--theme-accent)]" />
          <h2 className="aiq-heading mt-4 text-lg font-semibold">No attended quizzes yet</h2>
          <p className="aiq-muted mx-auto mt-2 max-w-md text-sm">
            Complete a quiz and it will appear here with your score and answer review.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendedQuizzesPage;
