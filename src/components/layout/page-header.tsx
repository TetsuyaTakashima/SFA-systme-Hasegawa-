export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0"><h1 className="text-xl leading-7 font-semibold tracking-normal md:text-2xl md:leading-8">{title}</h1>{description ? <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p> : null}</div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
