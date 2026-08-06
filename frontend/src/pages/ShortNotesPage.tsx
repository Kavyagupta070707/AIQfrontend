import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Play, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/study/PageHeader";
import { studyApi } from "@/lib/api";
import { downloadShortNotePdf, renderHighlightedText } from "@/lib/noteTools";
import mountainNight from "@/assets/theme-mountain-night.png";
import mountainMorning from "@/assets/theme-mountain-morning-light.png";
import { useStudyTheme } from "@/components/study/ThemeProvider";

const ShortNotesPage = ({ user }) => {
  const { theme } = useStudyTheme();
  const [shortNotes, setShortNotes] = useState([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);

  const load = () => studyApi.getShortNotes(user._id).then((res) => setShortNotes(res.data)).catch(() => setShortNotes([]));

  useEffect(() => {
    if (user?._id) load();
  }, [user]);

  useEffect(() => {
    if (!shortNotes.length) setActiveId(null);
  }, [shortNotes]);

  const activeNote: any = useMemo(
    () => shortNotes.find((note: any) => note._id === activeId),
    [shortNotes, activeId]
  );

  const activeCards = activeNote?.bullets || [];
  const currentCard = activeCards[cardIndex] || "";
  const revisionBackground = theme === "light" ? mountainMorning : mountainNight;
  const revisionShellTheme = theme === "light" ? "revision-player-shell-light" : "revision-player-shell-dark";

  const startRevision = (id: string) => {
    setActiveId(id);
    setCardIndex(0);
    setShowPlayer(true);
  };

  const remove = async (id: string) => {
    await studyApi.deleteShortNote(id);
    if (activeId === id) {
      setActiveId(null);
      setCardIndex(0);
      setShowPlayer(false);
    }
    await load();
    toast.success("Short notes removed");
  };

  return (
    <div>
      <PageHeader title="Short Notes" description="Choose a heading, press play, and revise bullet points as calm flash cards." />

      <section className="aiq-panel-strong rounded-xl border p-4 sm:p-5">
        <p className="aiq-accent px-1 text-xs font-semibold uppercase">Short Notes</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shortNotes.map((note: any) => {
              const isActive = activeNote?._id === note._id;
              return (
                <article key={note._id} className={`revision-topic-row flex min-h-[170px] flex-col rounded-lg border p-5 ${isActive ? "revision-topic-row-active" : ""}`}>
                  <div className="flex items-start gap-3">
                    <h2 className="aiq-heading min-w-0 flex-1 text-xl font-bold leading-7">{note.title || "Untitled short notes"}</h2>
                    <Button size="icon" variant="ghost" className="aiq-muted shrink-0 hover:bg-red-500/10 hover:text-red-400" onClick={() => remove(note._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-auto flex items-center gap-3 pt-6">
                    <Button variant="outline" className="aiq-button-soft shrink-0" onClick={() => downloadShortNotePdf(note) || toast.error("Could not download the PDF.")}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => startRevision(note._id)} className="aiq-button-primary flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </Button>
                  </div>
                </article>
              );
            })}

            {!shortNotes.length && (
              <p className="aiq-muted rounded-lg border border-dashed border-[var(--theme-border)] p-8 text-center text-sm">
                No short notes yet. Generate them from the Notes page.
              </p>
            )}
        </div>
      </section>

      {showPlayer && activeNote && (
        <div className="fixed inset-0 z-50 bg-[var(--theme-page)]">
          <div
            className="revision-player-scene relative flex h-full w-full items-center justify-center p-4"
            style={{ backgroundImage: `url(${revisionBackground})` }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPlayer(false)}
              className="absolute right-6 top-6 z-30 h-10 w-10 rounded-full text-[var(--theme-text)] hover:bg-[color-mix(in_srgb,var(--theme-text)_10%,transparent)]"
              aria-label="Close revision cards"
            >
              <X className="h-5 w-5" />
            </Button>

            <section className={`revision-player-shell ${revisionShellTheme} relative flex h-full max-h-[calc(100vh-32px)] w-full max-w-7xl flex-col rounded-xl border p-5`}>
              <div className="revision-player-header relative z-10 flex flex-col gap-4 border-b border-[var(--theme-border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="revision-player-kicker text-xs font-semibold uppercase">Revision Card</p>
                    <h2 className="revision-player-title mt-2 text-2xl font-bold">{activeNote.title || "Short Notes"}</h2>
                    <p className="revision-player-meta mt-1 text-sm">Card {activeCards.length ? cardIndex + 1 : 0} of {activeCards.length}</p>
                  </div>
                  <Button variant="outline" className="aiq-button-soft" onClick={() => downloadShortNotePdf(activeNote) || toast.error("Could not download the PDF.")}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>

                <div className="relative z-10 mt-6 flex min-h-0 flex-1 items-center justify-center">
                  <article className="revision-flash-card revision-flash-paper relative mx-auto flex min-h-[440px] w-full max-w-2xl items-center justify-center overflow-visible text-center">
                    <div className="revision-card-inner relative z-10">
                      <h3 className="revision-card-title mt-3 text-2xl font-bold">{activeNote.title || "Short Notes"}</h3>
                      <div className="revision-card-divider" />
                      {currentCard ? (
                        <p className="revision-card-text">{renderHighlightedText(currentCard)}</p>
                      ) : (
                        <p className="revision-card-text">No cards in this topic.</p>
                      )}
                    </div>
                  </article>
                </div>

                <div className="relative z-10 mt-5">
                  <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--theme-text)_12%,transparent)]">
                    <div
                      className="h-full rounded-full bg-[var(--theme-accent)] transition-all"
                      style={{ width: `${activeCards.length ? ((cardIndex + 1) / activeCards.length) * 100 : 0}%` }}
                    />
                  </div>

                  <div className="mt-5 grid gap-3 rounded-xl bg-[color-mix(in_srgb,var(--theme-surface)_72%,transparent)] p-4 backdrop-blur-md sm:grid-cols-3">
                <Button
                  variant="outline"
                  className="aiq-button-soft h-12"
                  disabled={!activeCards.length || cardIndex === 0}
                  onClick={() => setCardIndex((index) => Math.max(0, index - 1))}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button variant="outline" className="aiq-button-soft h-12" disabled={!activeCards.length} onClick={() => setCardIndex(0)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restart
                </Button>
                <Button
                  className="aiq-button-primary h-12"
                  disabled={!activeCards.length || cardIndex >= activeCards.length - 1}
                  onClick={() => setCardIndex((index) => Math.min(activeCards.length - 1, index + 1))}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                  </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortNotesPage;
