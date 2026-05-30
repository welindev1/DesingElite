export default function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="text-white/30 mt-2 text-sm">Sección en construcción...</p>
    </div>
  );
}
