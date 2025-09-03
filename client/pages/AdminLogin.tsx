import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentUser } from "@/lib/adminStore";

export default function AdminLogin() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-md py-24">
      <h1 className="text-3xl font-bold">Admin Login</h1>
      <p className="mt-2 text-muted-foreground">
        Enter your name to identify changes you make in the dashboard.
      </p>
      <div className="mt-6 space-y-4">
        <input
          className="w-full rounded-md border bg-background px-3 py-2"
          placeholder="Your name (e.g., Arzoo Srivastava)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          disabled={!name}
          onClick={() => {
            setCurrentUser({ name });
            navigate("/admin/dashboard");
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
