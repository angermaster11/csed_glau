type Props = { title: string; description?: string };

export default function Placeholder({ title, description }: Props) {
  return (
    <div className="container mx-auto py-24 text-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">
        {description ||
          "This page will be built next. Tell me what you want here and I'll generate it."}
      </p>
    </div>
  );
}
