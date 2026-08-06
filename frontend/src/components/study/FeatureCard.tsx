import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, value, onClick, tone = "teal" }) => {
  const tones = {
    teal: "bg-teal-500/15 text-teal-300 ring-teal-400/20",
    violet: "bg-violet-500/15 text-violet-300 ring-violet-400/20",
    blue: "bg-blue-500/15 text-blue-300 ring-blue-400/20",
    orange: "bg-orange-500/15 text-orange-300 ring-orange-400/20",
    amber: "bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-400/20",
  };

  return (
    <Card
      onClick={onClick}
      className="aiq-card aiq-card-hover group cursor-pointer"
    >
      <CardContent className="flex min-h-[148px] flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ring-1 transition ${tones[tone] || tones.teal}`}>
            <Icon className="h-6 w-6" />
          </div>
          <span className="aiq-heading text-3xl font-semibold">{value}</span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="aiq-heading text-base font-semibold">{title}</h3>
            <p className="aiq-muted mt-1 text-sm leading-6">{description}</p>
          </div>
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ${tones[tone] || tones.teal}`}>
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
