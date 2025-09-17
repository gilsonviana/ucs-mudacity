import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import bcrypt from "bcrypt";
import { getAdminClient } from "@/app/utils/supabase/admin";
import { buildSessionCookie, createSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    let adminClient;
    try {
      adminClient = getAdminClient();
    } catch (e: any) {
      if (/SUPABASE_SERVICE_ROLE_KEY/.test(e?.message)) {
        return NextResponse.json({ error: 'Configuração de servidor ausente' }, { status: 503 });
      }
      throw e;
    }
    const { data: user, error } = await adminClient
      .from("Users")
      .select("id, email, password_hash")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("Supabase error", error);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

  const token = await createSession({ uid: user.id, email: user.email });
    const res = NextResponse.json({ id: user.id, email: user.email });
    res.headers.append("Set-Cookie", buildSessionCookie(token));
    return res;
  } catch (e) {
    console.error("Login route error", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
