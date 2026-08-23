import { NextResponse } from "next/server";
import { isLLMConfigured } from "@/lib/llm";
import { requireStaff } from "@/lib/api-auth";

export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

    return NextResponse.json({
        provider: "deepseek",
        configured: isLLMConfigured(),
    });
}
