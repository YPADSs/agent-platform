import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }
  const prisma = getPrisma();
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return NextResponse.json({ error: "email already registered" }, { status: 409 });

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: { email: body.email, passwordHash, role: "USER" },
    select: { id: true, email: true, role: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}
