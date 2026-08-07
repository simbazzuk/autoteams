import type {
  RecommendationReviewRecord,
  RecommendationReviewRepository,
} from "@/lib/repositories/types";

const REVIEW_KEY =
  "autoteams-v20-recommendation-reviews";

export class LocalRecommendationReviewRepository
  implements RecommendationReviewRepository
{
  async list(): Promise<
    RecommendationReviewRecord[]
  > {
    if (
      typeof window === "undefined"
    ) {
      return [];
    }

    try {
      const raw =
        window.localStorage.getItem(
          REVIEW_KEY,
        );

      return raw
        ? (JSON.parse(
            raw,
          ) as RecommendationReviewRecord[])
        : [];
    } catch {
      return [];
    }
  }

  async save(
    reviews:
      RecommendationReviewRecord[],
  ): Promise<void> {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    window.localStorage.setItem(
      REVIEW_KEY,
      JSON.stringify(reviews),
    );
  }
}
