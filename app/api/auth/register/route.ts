import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import bcrypt from "bcrypt";
import { getAdminClient } from "@/app/utils/supabase/admin";
import {
  buildSessionCookie,
  createSession,
  SESSION_COOKIE,
} from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter ao menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Check existing user
    let adminClient;
    try {
      adminClient = getAdminClient();
    } catch (e: any) {
      if (/SUPABASE_SERVICE_ROLE_KEY/.test(e?.message)) {
        return NextResponse.json({ error: 'Configuração de servidor ausente' }, { status: 503 });
      }
      throw e;
    }
    const { data: existing, error: existingError } = await adminClient
      .from("Users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (existingError) {
      console.error("Supabase select error", existingError);
      return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);
    const { data: inserted, error: insertError } = await adminClient
      .from("Users")
      .insert({ email: normalizedEmail, password_hash })
      .select("id, email")
      .single();
    if (insertError || !inserted) {
      console.error("Insert error", insertError);
      return NextResponse.json(
        { error: "Não foi possível registrar" },
        { status: 500 }
      );
    }

    const sessionToken = await createSession({
      uid: inserted.id,
      email: inserted.email,
    });
  const res = NextResponse.json({ id: inserted.id, email: inserted.email });
  res.headers.set('Cache-Control', 'no-store');
    res.headers.append("Set-Cookie", buildSessionCookie(sessionToken));
    return res;
  } catch (e) {
    console.error("Register route error", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
