import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/study/PageHeader";
import { studyApi } from "@/lib/api";

const colors = [
  { name: "yellow", className: "bg-amber-500/15 text-[var(--theme-text)] ring-amber-400/25", dot: "bg-amber-300" },
  { name: "green", className: "bg-emerald-500/15 text-[var(--theme-text)] ring-emerald-400/25", dot: "bg-emerald-300" },
  { name: "blue", className: "bg-sky-500/15 text-[var(--theme-text)] ring-sky-400/25", dot: "bg-sky-300" },
  { name: "rose", className: "bg-rose-500/15 text-[var(--theme-text)] ring-rose-400/25", dot: "bg-rose-300" },
];

const StickyNotesPage = ({ user }) => {
  const [notes, setNotes] = useState([]);

  const load = () => studyApi.getStickyNotes(user._id).then((res) => setNotes(res.data)).catch(() => setNotes([]));

  useEffect(() => {
    if (user?._id) load();
  }, [user]);

  const add = async () => {
    await studyApi.saveStickyNote({ text: "New reminder", color: "yellow", createdBy: user._id });
    await load();
  };

  const update = async (note: any, patch: any) => {
    const next = { ...note, ...patch };
    setNotes(notes.map((item: any) => item._id === note._id ? next : item));
    await studyApi.updateStickyNote(note._id, next);
  };

  const remove = async (id: string) => {
    await studyApi.deleteStickyNote(id);
    await load();
  };

  return (
    <div>
      <PageHeader
        title="Sticky Notes"
        description="Small reminders for doubts, formulas, tasks, deadlines, and exam focus points."
        action={<Button onClick={add} className="aiq-button-primary"><Plus className="mr-2 h-4 w-4" />Add Sticky</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {notes.map((note: any) => {
          const color = colors.find((item) => item.name === note.color) || colors[0];
          return (
            <Card key={note._id} className={`aiq-card ring-1 ${color.className}`}>
              <CardContent className="space-y-3 p-4">
                <Textarea value={note.text} onChange={(e) => update(note, { text: e.target.value })} className="min-h-[140px] resize-none border-0 bg-transparent p-0 text-sm text-inherit shadow-none placeholder:text-[var(--theme-muted)] focus-visible:ring-0" />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {colors.map((item) => <button key={item.name} onClick={() => update(note, { color: item.name })} className={`h-5 w-5 rounded-full ring-1 ring-white/20 ${item.dot}`} aria-label={`Use ${item.name} note color`} />)}
                  </div>
                  <Button size="icon" variant="ghost" className="text-inherit hover:bg-white/10" onClick={() => remove(note._id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!notes.length && <p className="aiq-muted rounded-lg border border-dashed border-[var(--theme-border)] p-8 text-center text-sm sm:col-span-2 lg:col-span-4">No sticky notes yet.</p>}
      </div>
    </div>
  );
};

export default StickyNotesPage;
