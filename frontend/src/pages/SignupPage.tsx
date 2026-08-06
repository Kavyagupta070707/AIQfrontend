import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

const SignupPage = ({ onLoginRedirect, embedded = false }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Username and password are required");
      return;
    }
    setLoading(true);
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      await axios.post(`${BACKEND_URL}/api/auth/signup`, { username, password });
      toast.success("Account created! Please log in.");
      setUsername("");
      setPassword("");
      onLoginRedirect();
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${embedded ? "" : "theme-shell flex min-h-screen items-center justify-center px-4"} text-[var(--theme-text)]`}>
      <Card className="aiq-panel-strong w-full max-w-md overflow-hidden rounded-xl border">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--theme-accent)] text-white shadow-lg shadow-black/15">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="aiq-heading text-3xl font-bold">Create your space</CardTitle>
            <p className="aiq-muted mt-2 text-sm">Start a calm study workspace for roadmaps, notes, and practice.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <Label htmlFor="username" className="aiq-heading">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="aiq-input mt-2"
              />
            </div>
            <div>
              <Label htmlFor="password" className="aiq-heading">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="aiq-input mt-2"
              />
            </div>
            <Button type="submit" className="aiq-button-primary h-12 w-full text-base" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
            <div className="aiq-muted mt-2 text-center text-sm">
              Already have an account?{' '}
              <Button type="button" variant="link" className="px-1 text-[var(--theme-accent)] hover:text-[var(--theme-accent-strong)]" onClick={onLoginRedirect}>
                Log In
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
