import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentUser } from "@/lib/adminStore";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { login, setToken } from "@/lib/api";

function deriveName(email: string) {
  const base = email.split("@")[0] || "admin";
  return base
    .split(/[._-]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validEmail = /.+@.+\..+/.test(email);
  const validPass = password.length >= 6;
  const isValid = validEmail && validPass && !loading;

  const onSubmit = async () => {
    try {
      setError(null);
      if (!isValid) {
        setError("Enter a valid email and at least 6 character password.");
        return;
      }
      setLoading(true);
      const res = await login(email, password);
      setToken(res.access_token);
      setCurrentUser({
        name: deriveName(email),
        email,
        id: res.id,
        roll: res.roll,
      });
      navigate("/admin/dashboard");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-24">
      <h1 className="text-3xl font-bold">Admin Login</h1>
      <p className="mt-2 text-muted-foreground">
        Sign in with your admin account.
      </p>

      <div className="mt-6 space-y-4">
        <div className="relative">
          <input
            type="email"
            className="w-full rounded-md border bg-background px-3 py-2 pl-9"
            placeholder="you@csed.club"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            className="w-full rounded-md border bg-background px-3 py-2 pr-10 pl-9"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-2 p-1 rounded hover:bg-accent"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <button
          className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          disabled={!isValid}
          onClick={onSubmit}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </div>
  );
}
