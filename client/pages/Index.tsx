import ClubHero from "@/components/hero/ClubHero";
import EventsPreview from "@/components/sections/EventsPreview";
import ProjectsPreview from "@/components/sections/ProjectsPreview";
import MembersPreview from "@/components/sections/MembersPreview";

export default function Index() {
  return (
    <div>
      <ClubHero />
      <EventsPreview />
      <ProjectsPreview />
      <MembersPreview />
    </div>
  );
}
