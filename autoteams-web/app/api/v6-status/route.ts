import {
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

export async function GET() {
  return NextResponse.json({
    release:
      "v6.0.0",
    feature:
      "recommendation-lifecycle",
    states: [
      "draft",
      "submitted",
      "approved",
      "rejected",
      "archived",
    ],
    auditMetadata:
      true,
  });
}
