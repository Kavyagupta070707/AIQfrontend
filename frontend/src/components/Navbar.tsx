import { BookOpen, FileText, Home, ListChecks, LogOut, NotebookPen, PlusCircle, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onNavigate?: (path: string) => void;
}

const Navbar = ({ user, onLogout, onNavigate }: NavbarProps) => {
  if (!user) return null;
  const currentPath = window.location.pathname;

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="aiq-panel sticky top-0 z-50 w-full border-b">
      <div className="mx-auto max-w-[1500px] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate?.('/dashboard')}>
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-600 shadow-lg shadow-teal-400/25 ring-1 ring-teal-300/30">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="aiq-heading hidden text-2xl font-semibold sm:block">
                AIQ Study
              </span>
            </div>
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <div className="aiq-subcard hidden items-center rounded-lg border shadow-sm lg:flex">
            <Button
              variant="ghost"
              className={`h-14 rounded-none px-5 ${currentPath === "/dashboard" ? "aiq-accent bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)] shadow-[inset_0_-3px_0_var(--theme-accent)]" : "aiq-muted hover:bg-[color-mix(in_srgb,var(--theme-accent)_8%,transparent)] hover:text-[var(--theme-text)]"}`}
              onClick={() => onNavigate?.('/dashboard')}
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className={`h-14 rounded-none px-5 ${currentPath.startsWith("/roadmaps") ? "aiq-accent bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)] shadow-[inset_0_-3px_0_var(--theme-accent)]" : "aiq-muted hover:bg-[color-mix(in_srgb,var(--theme-accent)_8%,transparent)] hover:text-[var(--theme-text)]"}`}
              onClick={() => onNavigate?.('/roadmaps')}
            >
              <ListChecks className="w-4 h-4 mr-2" />
              Roadmaps
            </Button>
            <Button
              variant="ghost"
              className={`h-14 rounded-none px-5 ${currentPath === "/notes" ? "aiq-accent bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)] shadow-[inset_0_-3px_0_var(--theme-accent)]" : "aiq-muted hover:bg-[color-mix(in_srgb,var(--theme-accent)_8%,transparent)] hover:text-[var(--theme-text)]"}`}
              onClick={() => onNavigate?.('/notes')}
            >
              <NotebookPen className="w-4 h-4 mr-2" />
              Notes
            </Button>
            <Button
              variant="ghost"
              className={`h-14 rounded-none px-5 ${currentPath === "/short-notes" ? "aiq-accent bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)] shadow-[inset_0_-3px_0_var(--theme-accent)]" : "aiq-muted hover:bg-[color-mix(in_srgb,var(--theme-accent)_8%,transparent)] hover:text-[var(--theme-text)]"}`}
              onClick={() => onNavigate?.('/short-notes')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Short Notes
            </Button>
            <Button
              variant="ghost"
              className={`h-14 rounded-none px-5 ${currentPath === "/sticky-notes" ? "aiq-accent bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)] shadow-[inset_0_-3px_0_var(--theme-accent)]" : "aiq-muted hover:bg-[color-mix(in_srgb,var(--theme-accent)_8%,transparent)] hover:text-[var(--theme-text)]"}`}
              onClick={() => onNavigate?.('/sticky-notes')}
            >
              <StickyNote className="w-4 h-4 mr-2" />
              Sticky
            </Button>
            <Button
              variant="ghost"
              className={`h-14 rounded-none px-5 ${currentPath === "/create" ? "aiq-accent bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)] shadow-[inset_0_-3px_0_var(--theme-accent)]" : "aiq-muted hover:bg-[color-mix(in_srgb,var(--theme-accent)_8%,transparent)] hover:text-[var(--theme-text)]"}`}
              onClick={() => onNavigate?.('/create')}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="aiq-heading text-sm font-semibold">
                {user.username}
              </span>
              <span className="aiq-accent text-xs">Student</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-2 ring-teal-400/30 hover:ring-teal-300/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-teal-600 text-white font-semibold">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="aiq-panel-strong w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.username}
                    </p>
                    <p className="aiq-muted text-xs leading-none">
                      Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate?.('/dashboard')}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate?.('/create')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Practice Quiz</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate?.('/roadmaps')}>
                  <ListChecks className="mr-2 h-4 w-4" />
                  <span>Roadmaps</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate?.('/notes')}>
                  <NotebookPen className="mr-2 h-4 w-4" />
                  <span>Notes</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
