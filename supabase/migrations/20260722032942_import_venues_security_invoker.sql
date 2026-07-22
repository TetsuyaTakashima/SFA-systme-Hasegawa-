-- The import function relies on the caller's RLS policies in addition to its admin check.
alter function public.import_venues(jsonb) security invoker;
