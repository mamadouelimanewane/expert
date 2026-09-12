import { NextResponse } from "next/server";
import { descriptionLLM } from "@/lib/llm";
import { requireStaff } from "@/lib/api-auth";

export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

    return NextResponse.json(descriptionLLM());
}
