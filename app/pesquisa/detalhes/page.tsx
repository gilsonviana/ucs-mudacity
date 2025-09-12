import { redirect } from "next/navigation";

// This page handles legacy access via /pesquisa/detalhes?uf=RS
// It will redirect to the dynamic segment route /pesquisa/detalhes/RS
export default function DetalhesQueryRedirect({ searchParams }: { searchParams: { uf?: string } }) {
  const uf = (searchParams.uf || "").toUpperCase();
  if (uf) {
    redirect(`/pesquisa/detalhes/${uf}`);
  }
  // If no uf provided, you might want to redirect back to pesquisa root
  redirect("/pesquisa");
}
