import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "7.0.0",
    feature: "Atlas Support",
    readOnly: true,
    geminiConfigured: Boolean(
      process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
    ),
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });
}
