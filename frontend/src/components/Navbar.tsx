import { User, LogOut, Home, Trophy, PlusCircle } from "lucide-react";
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

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-slate-900/95 supports-[backdrop-filter]:via-blue-900/95 supports-[backdrop-filter]:to-indigo-900/95 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate?.('/dashboard')}>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  AI
                </span>
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                Quiz AI
              </span>
            </div>
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              className="text-slate-300 hover:bg-slate-800/50 hover:text-white"
              onClick={() => onNavigate?.('/dashboard')}
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="text-slate-300 hover:bg-slate-800/50 hover:text-white"
              onClick={() => onNavigate?.('/create')}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-white">
                {user.username}
              </span>
              <span className="text-xs text-cyan-400">Quiz Master</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-2 ring-cyan-500/50 hover:ring-cyan-400"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
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
                  <span>Create Quiz</span>
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
