import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ATLAS_AI_USAGE_COOKIE,
  readAtlasAiAllowance,
} from "@/lib/ai/recommendation-usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();

  const allowance =
    readAtlasAiAllowance(
      cookieStore
        .get(ATLAS_AI_USAGE_COOKIE)
        ?.value,
    );

  return NextResponse.json(
    {
      plan: "free",
      ...allowance,
    },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    },
  );
}
