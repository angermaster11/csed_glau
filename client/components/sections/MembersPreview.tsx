type Member = { name: string; role: string; avatar: string };

const members: Member[] = [
  {
    name: "Arzoo Srivastava",
    role: "President",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Rahul Verma",
    role: "Assistant",
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Priya Sharma",
    role: "Head of Projects",
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Aman Gupta",
    role: "Events Lead",
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop",
  },
];

export default function MembersPreview() {
  return (
    <section id="members" className="container mx-auto py-16 md:py-24">
      <h2 className="text-2xl sm:text-3xl font-bold">Core Team</h2>
      <p className="text-muted-foreground mt-2">
        Meet the leaders driving CSED forward.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((m) => (
          <div
            key={m.name}
            className="rounded-xl border bg-card p-6 text-center hover:shadow-lg transition"
          >
            <img
              src={m.avatar}
              alt={m.name}
              className="mx-auto h-24 w-24 rounded-full object-cover"
            />
            <h3 className="mt-4 font-semibold">{m.name}</h3>
            <p className="text-sm text-muted-foreground">{m.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
