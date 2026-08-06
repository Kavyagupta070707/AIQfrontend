import Navbar from "@/components/Navbar";
import mountainNight from "@/assets/theme-mountain-night.png";

const StudyShell = ({ user, onLogout, onNavigate, children }) => {
  return (
    <div className="theme-shell min-h-screen text-[var(--theme-text)]">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center bg-no-repeat opacity-[var(--theme-world-opacity)] transition-opacity duration-500"
        style={{ backgroundImage: `url(${mountainNight})` }}
      />
      <div className="theme-world-veil pointer-events-none fixed inset-0 bg-[var(--theme-world-overlay)]" />
      <Navbar user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <main className="relative mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default StudyShell;
