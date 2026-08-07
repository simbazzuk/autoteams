import {
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

export async function GET() {
  return NextResponse.json({
    release:
      "v6.1.0",
    features: [
      "recommendation-detail",
      "recommendation-compare",
      "member-differences",
      "selection-explanations",
      "team-health-scorecard",
    ],
    additionalGeminiCalls:
      false,
  });
}
