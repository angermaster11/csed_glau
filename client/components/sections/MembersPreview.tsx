import { useQuery } from "@tanstack/react-query";
import { fetchMembers, type ApiMember } from "@/lib/membersApi";

export default function MembersPreview() {
  const { data } = useQuery<ApiMember[]>({
    queryKey: ["members", "preview"],
    queryFn: fetchMembers,
  });
  const list = Array.isArray(data) ? data : [];
  return (
    <section id="members" className="container mx-auto py-16 md:py-24">
      <h2 className="text-2xl sm:text-3xl font-bold">Core Team</h2>
      <p className="text-muted-foreground mt-2">
        Meet the leaders driving CSED forward.
      </p>
      <div className="mt-8 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {list.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No members to show.
          </div>
        ) : (
          <div className="flex gap-6 snap-x snap-mandatory">
            {list.map((m) => (
              <div
                key={m._id}
                className="min-w-[240px] snap-start rounded-xl border bg-card p-6 text-center hover:shadow-lg transition"
              >
                {m.profile_pic && (
                  <img
                    src={m.profile_pic}
                    alt={m.name}
                    className="mx-auto h-24 w-24 rounded-full object-cover"
                  />
                )}
                <h3 className="mt-4 font-semibold">{m.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {m.designation || "Member"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
