type AdminEmptyStateProps = {
  title: string;
  description: string;
};

export function AdminEmptyState({ title, description }: AdminEmptyStateProps) {
  return (
    <div className="admin-panel rounded-3xl px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}
