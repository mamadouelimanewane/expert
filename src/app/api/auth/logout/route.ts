import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";

export async function POST() {
    await AuthService.logout();
    return NextResponse.json({ success: true });
}
