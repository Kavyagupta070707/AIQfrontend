import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/study/PageHeader";
import { studyApi } from "@/lib/api";

const RoadmapCreatorPage = ({ user }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: "", goal: "", level: "Beginner", duration: "", dailyStudyTime: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    if (!form.subject.trim()) return toast.error("Enter a subject or topic");
    setLoading(true);
    try {
      const generated = await studyApi.generateRoadmap(form);
      const saved = await studyApi.saveRoadmap({ ...generated.data, createdBy: user._id });
      toast.success("Roadmap created");
      navigate(`/roadmaps/${saved.data._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Could not create roadmap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Roadmap" description="Tell AI what you want to study and get a careful, practical learning plan." />
      <Card className="aiq-card max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div><Label className="aiq-heading">Subject or topic</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Calculus, React, Biology, UPSC polity..." className="aiq-input mt-2" /></div>
            <div><Label className="aiq-heading">Goal</Label><Input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="Finish basics, prepare for exam, build a project..." className="aiq-input mt-2" /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label className="aiq-heading">Level</Label><Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="aiq-input mt-2" /></div>
              <div><Label className="aiq-heading">Duration</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="30 days" className="aiq-input mt-2" /></div>
              <div><Label className="aiq-heading">Daily time</Label><Input value={form.dailyStudyTime} onChange={(e) => setForm({ ...form, dailyStudyTime: e.target.value })} placeholder="1 hour" className="aiq-input mt-2" /></div>
            </div>
            <Button disabled={loading} className="aiq-button-primary">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Roadmap
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoadmapCreatorPage;
