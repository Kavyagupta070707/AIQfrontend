import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Download,
  FileText,
  FlaskConical,
  Folder,
  Image,
  Italic,
  Link as LinkIcon,
  List,
  Loader2,
  Maximize2,
  NotebookPen,
  Plus,
  Quote,
  ChevronLeft,
  ChevronRight,
  Redo2,
  Save,
  Sigma,
  Sparkles,
  Star,
  Trash2,
  Underline,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { studyApi } from "@/lib/api";
import { downloadNotePdf, renderFormattedNoteContent } from "@/lib/noteTools";

const emptyNote = { title: "", subject: "", content: "", tags: [] };

const toolbarItems = [
  { icon: Italic, label: "Italic", action: "italic" },
  { icon: Underline, label: "Underline", action: "underline" },
  { icon: List, label: "List", action: "list" },
  { icon: LinkIcon, label: "Link", action: "link" },
  { icon: Image, label: "Image", action: "image" },
  { icon: Code2, label: "Code", action: "code" },
  { icon: Quote, label: "Quote", action: "quote" },
];

const notebookIcons = [BookOpen, Code2, Sigma, FlaskConical, Sparkles];

const NotesPage = ({ user }) => {
  const [notes, setNotes] = useState([]);
  const [active, setActive] = useState<any>(emptyNote);
  const [topic, setTopic] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingShort, setLoadingShort] = useState(false);
  const [libraryView, setLibraryView] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [blockStyle, setBlockStyle] = useState("normal");
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [showBookView, setShowBookView] = useState(false);
  const [bookPage, setBookPage] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const load = () => studyApi.getNotes(user._id).then((res) => setNotes(res.data)).catch(() => setNotes([]));

  useEffect(() => {
    if (user?._id) load();
  }, [user]);

  const save = async () => {
    if (!active.title.trim()) return toast.error("Add a note title");
    const payload = { ...active, createdBy: user._id };
    const res = active._id ? await studyApi.updateNote(active._id, payload) : await studyApi.saveNote(payload);
    setActive(res.data);
    await load();
    toast.success("Note saved");
  };

  const remove = async (id: string) => {
    await studyApi.deleteNote(id);
    setActive(emptyNote);
    await load();
    toast.success("Note deleted");
  };

  const generateNotes = async () => {
    if (!topic.trim()) return toast.error("Enter a topic first");
    setLoadingNotes(true);
    try {
      const generated = await studyApi.generateNotes({ topic, subject: active.subject });
      const saved = await studyApi.saveNote({ ...generated.data, createdBy: user._id });
      setActive(saved.data);
      await load();
      toast.success("Detailed notes generated");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Could not generate notes");
    } finally {
      setLoadingNotes(false);
    }
  };

  const makeShortNotes = async () => {
    if (!active.content.trim()) return toast.error("Write notes first");
    setLoadingShort(true);
    try {
      const generated = await studyApi.generateShortNotes(active);
      await studyApi.saveShortNote({ ...generated.data, sourceNoteId: active._id, createdBy: user._id });
      toast.success("Short notes created");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Could not create short notes");
    } finally {
      setLoadingShort(false);
    }
  };

  const focusEditor = (start: number, end = start) => {
    requestAnimationFrame(() => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      editor.setSelectionRange(start, end);
    });
  };

  const commitContent = (content: string, selectionStart?: number, selectionEnd?: number) => {
    setHistory((items) => [...items.slice(-30), active.content || ""]);
    setFuture([]);
    setActive({ ...active, content });
    focusEditor(selectionStart ?? content.length, selectionEnd ?? selectionStart ?? content.length);
  };

  const getEditorSelection = () => {
    const content = active.content || "";
    const editor = editorRef.current;
    const start = editor?.selectionStart ?? content.length;
    const end = editor?.selectionEnd ?? content.length;
    return { content, start, end, selected: content.slice(start, end) };
  };

  const wrapSelection = (prefix: string, suffix: string, placeholder: string) => {
    const { content, start, end, selected } = getEditorSelection();
    const text = selected || placeholder;
    const replacement = `${prefix}${text}${suffix}`;
    commitContent(content.slice(0, start) + replacement + content.slice(end), start + prefix.length, start + prefix.length + text.length);
  };

  const prefixLines = (prefix: string, placeholder: string) => {
    const { content, start, end, selected } = getEditorSelection();
    if (!selected) {
      const replacement = `${prefix}${placeholder}`;
      commitContent(content.slice(0, start) + replacement + content.slice(end), start + prefix.length, start + replacement.length);
      return;
    }
    const replacement = selected
      .split("\n")
      .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
      .join("\n");
    commitContent(content.slice(0, start) + replacement + content.slice(end), start, start + replacement.length);
  };

  const applyBlockStyle = (style: string) => {
    setBlockStyle(style);
    if (style === "normal") return;
    if (style === "heading") prefixLines("## ", "Heading");
    if (style === "subheading") prefixLines("### ", "Subheading");
    if (style === "bullets") prefixLines("- ", "List item");
    if (style === "quote") prefixLines("> ", "Quote");
  };

  const applyToolbarAction = (action: string) => {
    if (action === "bold") wrapSelection("**", "**", "bold text");
    if (action === "italic") wrapSelection("*", "*", "italic text");
    if (action === "underline") wrapSelection("<u>", "</u>", "underlined text");
    if (action === "list") prefixLines("- ", "List item");
    if (action === "link") wrapSelection("[", "](https://example.com)", "link text");
    if (action === "image") wrapSelection("![", "](https://image-url.com/image.png)", "image alt text");
    if (action === "code") wrapSelection("`", "`", "code");
    if (action === "quote") prefixLines("> ", "Quote");
  };

  const undoContentChange = () => {
    if (!history.length) return;
    const previous = history[history.length - 1];
    setFuture((items) => [active.content || "", ...items].slice(0, 31));
    setHistory((items) => items.slice(0, -1));
    setActive({ ...active, content: previous });
    focusEditor(previous.length);
  };

  const redoContentChange = () => {
    if (!future.length) return;
    const next = future[0];
    setHistory((items) => [...items.slice(-30), active.content || ""]);
    setFuture((items) => items.slice(1));
    setActive({ ...active, content: next });
    focusEditor(next.length);
  };

  const subjects = notes.reduce((acc: Record<string, number>, note: any) => {
    const subject = note.subject || "General";
    acc[subject] = (acc[subject] || 0) + 1;
    return acc;
  }, {});

  const favoriteCount = notes.filter((note: any) => note.favorite || note.favorited || note.starred).length;
  const recentlyEditedNotes = [...notes]
    .filter((note: any) => note.updatedAt || note.createdAt)
    .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
    .slice(0, 8);
  const recentlyEdited = recentlyEditedNotes.length;
  const wordCount = String(active.content || "").trim() ? String(active.content || "").trim().split(/\s+/).length : 0;
  const notePages = (() => {
    const blocks = String(active.content || "")
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean);
    if (!blocks.length) return [];
    const pages: string[] = [];
    let page = "";
    const maxPageLength = 1150;

    for (const block of blocks) {
      const nextPage = page ? `${page}\n\n${block}` : block;
      if (page && nextPage.length > maxPageLength) {
        pages.push(page);
        page = block;
      } else {
        page = nextPage;
      }
    }
    if (page) pages.push(page);
    return pages;
  })();
  const currentBookPage = notePages[bookPage] || "";
  const visibleNotes = (() => {
    if (libraryView === "favorites") return notes.filter((note: any) => note.favorite || note.favorited || note.starred);
    if (libraryView === "recent") return recentlyEditedNotes;
    if (libraryView === "trash") return [];
    if (libraryView === "notebook") return notes.filter((note: any) => (note.subject || "General") === selectedSubject);
    return notes;
  })();
  const libraryTitle = libraryView === "notebook" ? selectedSubject : libraryView === "recent" ? "Recently Edited" : libraryView === "favorites" ? "Favorites" : libraryView === "trash" ? "Trash" : "Saved Notes";
  const openNote = (note: any) => {
    setHistory([]);
    setFuture([]);
    setBookPage(0);
    setActive(note);
  };
  const selectLibraryView = (view: string) => {
    setLibraryView(view);
    setSelectedSubject("");
  };

  return (
    <div className="notes-workspace grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="notes-sidebar relative self-start overflow-hidden rounded-xl border border-[var(--theme-border)] p-5 lg:sticky lg:top-6">
        <div className="relative z-10">
          <p className="aiq-accent text-xs font-semibold uppercase tracking-normal">My Notes</p>
          <Button
            onClick={() => {
              setHistory([]);
              setFuture([]);
              setActive(emptyNote);
            }}
            className="aiq-button-primary mt-5 w-full justify-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>

          <div className="mt-6 space-y-2">
            {[
              { id: "all", icon: FileText, label: "All Notes", count: notes.length },
              { id: "favorites", icon: Star, label: "Favorites", count: favoriteCount },
              { id: "recent", icon: Clock3, label: "Recently Edited", count: recentlyEdited },
              { id: "trash", icon: Trash2, label: "Trash", count: 0 },
            ].map(({ id, icon: Icon, label, count }) => (
              <button
                key={id}
                onClick={() => selectLibraryView(id)}
                className={`notes-nav-item group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm ${libraryView === id ? "bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)] text-[var(--theme-text)]" : ""}`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                <span className="rounded-full px-2 py-0.5 text-xs">{count}</span>
              </button>
            ))}
          </div>

          <div className="my-6 h-px bg-[var(--theme-border)]" />

          <div className="flex items-center justify-between">
            <p className="aiq-accent text-xs font-semibold uppercase tracking-normal">Notebooks</p>
            <Button size="icon" variant="ghost" className="aiq-accent h-7 w-7 hover:bg-[var(--theme-subcard)]">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {Object.entries(subjects).slice(0, 5).map(([subject, count], index) => {
              const Icon = notebookIcons[index % notebookIcons.length];
              return (
                <button
                  key={subject}
                  onClick={() => {
                    setSelectedSubject(subject);
                    setLibraryView("notebook");
                  }}
                  className={`notes-nav-item flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm ${libraryView === "notebook" && selectedSubject === subject ? "bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)] text-[var(--theme-text)]" : ""}`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)] text-[var(--theme-accent)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate">{subject}</span>
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-xs">{count}</span>
                </button>
              );
            })}
            {!Object.keys(subjects).length && <p className="aiq-muted rounded-lg px-2.5 py-2 text-sm">No notebooks yet.</p>}
          </div>

          <div className="my-6 h-px bg-[var(--theme-border)]" />

          <div className="flex items-center justify-between">
            <p className="aiq-accent text-xs font-semibold uppercase tracking-normal">{libraryTitle}</p>
            <span className="aiq-muted text-xs">{visibleNotes.length}</span>
          </div>
          <div className="notes-saved-list mt-3 space-y-2 overflow-y-auto pr-1">
            {visibleNotes.map((note: any) => (
              <button
                key={note._id}
                onClick={() => openNote(note)}
                className={`notes-note-item w-full rounded-lg border border-transparent p-3 text-left transition ${active?._id === note._id ? "border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)]" : "hover:border-[var(--theme-border)] hover:bg-[var(--theme-subcard)]"}`}
              >
                <p className="aiq-heading truncate text-sm font-semibold">{note.title || "Untitled note"}</p>
                <p className="aiq-muted mt-1 truncate text-xs">{note.subject || "General"}</p>
                <p className="aiq-muted mt-2 line-clamp-2 text-xs leading-5">{note.content || "No content yet."}</p>
              </button>
            ))}
            {!visibleNotes.length && (
              <p className="aiq-muted rounded-lg border border-dashed border-[var(--theme-border)] p-3 text-sm">
                {libraryView === "trash" ? "Deleted notes are removed permanently." : "No notes in this view."}
              </p>
            )}
          </div>
        </div>

        <div className="notes-inspiration relative z-10 mt-6 rounded-lg border border-[var(--theme-border)] p-4">
          <Sparkles className="h-5 w-5 text-[var(--theme-accent)]" />
          <p className="aiq-heading mt-3 text-sm font-semibold">Need inspiration?</p>
          <p className="aiq-muted mt-1 text-xs">Let AI help you start.</p>
        </div>
      </aside>

      <main className="notes-editor-surface rounded-xl border border-[var(--theme-border)] p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="aiq-heading flex items-center gap-2 text-2xl font-semibold">
              {active._id ? "Edit Note" : "Create New Note"}
              <Sparkles className="h-5 w-5 text-[var(--theme-accent)]" />
            </h1>
            <p className="aiq-muted mt-2 text-sm">Capture your ideas, organize your knowledge, and revise smarter.</p>
          </div>
         
        </div>

        <section className="notes-ai-strip mt-7 rounded-xl border p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="aiq-heading flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-[var(--theme-accent)]" />
                AI Note Assistant
                <span className="rounded-full bg-[color-mix(in_srgb,var(--theme-accent)_14%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--theme-accent)]">Beta</span>
              </p>
              <p className="aiq-muted mt-2 text-xs">Enter a topic and AI will draft notes, key points, and more for you.</p>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row xl:max-w-xl">
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Photosynthesis in plants" className="aiq-input h-11" />
              <Button onClick={generateNotes} disabled={loadingNotes || !topic.trim()} className="aiq-button-primary h-11 shrink-0">
                {loadingNotes ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <Label className="aiq-muted flex items-center gap-2 text-xs font-medium">
              <FileText className="h-4 w-4" />
              Title
            </Label>
            <Input value={active.title} onChange={(e) => setActive({ ...active, title: e.target.value })} placeholder="Photosynthesis basics" className="aiq-input mt-2 h-11" />
          </div>
          <div>
            <Label className="aiq-muted flex items-center gap-2 text-xs font-medium">
              <Folder className="h-4 w-4" />
              Subject / Notebook
            </Label>
            <Input value={active.subject} onChange={(e) => setActive({ ...active, subject: e.target.value })} placeholder="Biology" className="aiq-input mt-2 h-11" />
          </div>
        </section>

        <section className="notes-editor mt-6 overflow-hidden rounded-xl border border-[var(--theme-border)]">
          <div className="notes-toolbar flex flex-wrap items-center gap-2 border-b border-[var(--theme-border)] px-4 py-3">
            <select
              value={blockStyle}
              onChange={(e) => applyBlockStyle(e.target.value)}
              className="notes-tool h-8 rounded-md border-0 bg-transparent px-3 text-xs font-medium outline-none"
              aria-label="Text style"
            >
              <option value="normal">Normal</option>
              <option value="heading">Heading</option>
              <option value="subheading">Subheading</option>
              <option value="bullets">Bullets</option>
              <option value="quote">Quote</option>
            </select>
            <div className="mx-1 h-6 w-px bg-[var(--theme-border)]" />
            <Button type="button" variant="ghost" onClick={() => applyToolbarAction("bold")} className="notes-tool h-8 w-8 p-0 font-bold">B</Button>
            {toolbarItems.map(({ icon: Icon, label, action }) => (
              <Button key={label} type="button" variant="ghost" aria-label={label} onClick={() => applyToolbarAction(action)} className="notes-tool h-8 w-8 p-0">
                <Icon className="h-4 w-4" />
              </Button>
            ))}
            <div className="ml-auto flex gap-1">
              <Button type="button" variant="ghost" aria-label="Undo" onClick={undoContentChange} disabled={!history.length} className="notes-tool h-8 w-8 p-0"><Undo2 className="h-4 w-4" /></Button>
              <Button type="button" variant="ghost" aria-label="Redo" onClick={redoContentChange} disabled={!future.length} className="notes-tool h-8 w-8 p-0"><Redo2 className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="min-h-[420px]">
            <Textarea
              ref={editorRef}
              value={active.content}
              onChange={(e) => {
                setFuture([]);
                setActive({ ...active, content: e.target.value });
              }}
              className="notes-writing-area min-h-[420px] resize-none rounded-none border-0 bg-transparent p-5 text-sm leading-7 shadow-none focus-visible:ring-0"
              placeholder="Write detailed notes here..."
            />
          </div>

          <div className="notes-editor-footer flex flex-col gap-3 border-t border-[var(--theme-border)] px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-[var(--theme-accent)]">
              <Check className="h-4 w-4" />
              Autosaved locally
            </span>
            <span className="aiq-muted flex items-center gap-3">
              {wordCount} words
              <Maximize2 className="h-4 w-4" />
            </span>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {active._id && (
            <Button onClick={() => remove(active._id)} variant="outline" className="border-red-400/30 bg-red-500/10 text-red-500 hover:bg-red-500/15">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          <Button onClick={makeShortNotes} variant="outline" disabled={loadingShort} className="aiq-button-soft">
            {loadingShort ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <NotebookPen className="mr-2 h-4 w-4" />}
            Save as Short Notes
          </Button>
          <Button onClick={() => downloadNotePdf(active) || toast.error("Could not download the PDF.")} variant="outline" disabled={!active.content?.trim()} className="aiq-button-soft">
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button
            onClick={() => {
              setBookPage(0);
              setShowBookView(true);
            }}
            variant="outline"
            disabled={!active.content?.trim()}
            className="aiq-button-soft"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            View Notes
          </Button>
          <Button onClick={save} className="aiq-button-primary">
            <Save className="mr-2 h-4 w-4" />
            Save Note
          </Button>
        </div>
      </main>

      {showBookView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-md">
          <div className="notes-book-modal relative w-full max-w-5xl">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowBookView(false)}
              className="absolute -right-2 -top-12 h-10 w-10 rounded-full text-slate-200 hover:bg-white/10 hover:text-white"
              aria-label="Close notes book"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="notes-book-reader">
              <div className="notes-book-cover-edge" />
              <section key={bookPage} className="notes-book-single-page">
                <div className="flex flex-col gap-2 border-b border-emerald-900/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-emerald-700">{active.subject || "Study Notes"}</p>
                    <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-950">{active.title || "Untitled note"}</h2>
                  </div>
                  <p className="text-sm font-semibold text-slate-500">Page {notePages.length ? bookPage + 1 : 0} / {notePages.length}</p>
                </div>
                {currentBookPage ? (
                  <div className="notes-book-content mt-6 space-y-4 text-base leading-8">{renderFormattedNoteContent(currentBookPage)}</div>
                ) : (
                  <p className="mt-6 text-sm text-slate-500">No note content to display.</p>
                )}
              </section>
            </div>

            <div className="mt-5 flex justify-center gap-3">
              <Button
                variant="outline"
                className="aiq-button-soft"
                disabled={bookPage === 0}
                onClick={() => setBookPage((page) => Math.max(0, page - 1))}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous Page
              </Button>
              <Button
                className="aiq-button-primary"
                disabled={!notePages.length || bookPage >= notePages.length - 1}
                onClick={() => setBookPage((page) => Math.min(notePages.length - 1, page + 1))}
              >
                Next Page
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
