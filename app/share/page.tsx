import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ url?: string; title?: string; text?: string }>;
}

export default async function SharePage({ searchParams }: Props) {
  const { url, text } = await searchParams;
  const shared = url || text || "";
  if (shared) {
    redirect(`/?share=${encodeURIComponent(shared)}`);
  }
  redirect("/");
}
