import { useStudyTheme } from "@/components/study/ThemeProvider";

const leaves = [
  { top: "8%", delay: "0s", duration: "24s", size: "18px" },
  { top: "18%", delay: "5s", duration: "31s", size: "14px" },
  { top: "30%", delay: "11s", duration: "27s", size: "20px" },
  { top: "42%", delay: "2s", duration: "35s", size: "16px" },
  { top: "56%", delay: "8s", duration: "29s", size: "13px" },
  { top: "70%", delay: "14s", duration: "33s", size: "17px" },
  { top: "84%", delay: "4s", duration: "26s", size: "15px" },
  { top: "24%", delay: "17s", duration: "38s", size: "12px" },
];

const stars = [
  { top: "10%", delay: "1s", duration: "3.2s" },
  { top: "18%", delay: "8s", duration: "2.8s" },
  { top: "28%", delay: "15s", duration: "3.6s" },
  { top: "38%", delay: "23s", duration: "3s" },
];

const ThemeAtmosphere = () => {
  const { theme } = useStudyTheme();

  return (
    <div className="theme-atmosphere pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
      {theme === "light"
        ? leaves.map((leaf, index) => (
            <span
              key={`leaf-${index}`}
              className="theme-leaf"
              style={{
                top: leaf.top,
                animationDelay: leaf.delay,
                animationDuration: leaf.duration,
                width: leaf.size,
                height: leaf.size,
              }}
            />
          ))
        : stars.map((star, index) => (
            <span
              key={`star-${index}`}
              className="theme-shooting-star"
              style={{
                top: star.top,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}
    </div>
  );
};

export default ThemeAtmosphere;
