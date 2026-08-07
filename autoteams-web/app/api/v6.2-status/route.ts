import {
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

export async function GET() {
  return NextResponse.json({
    release:
      "v6.2.1",
    feature:
      "recommendation-audit-timeline",
    installation:
      "safe-full-component",
    collection:
      "recommendationEvents",
    atomicLifecycleAudit:
      true,
    additionalGeminiCalls:
      false,
  });
}
