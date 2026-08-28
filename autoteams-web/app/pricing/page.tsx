import {
  PageShell,
} from "@/components/Site";
import { PricingPlans } from "@/components/pricing/PricingPlans";

export const metadata = {
  title: "Pricing & Plans | TeamScience.ai",
  description:
    "Explore the planned TeamScience.ai Free, Pro and Business pricing model.",
};

export default function PricingPage() {
  return (
    <PageShell>
      <div data-pricing-page="true">
      <PricingPlans />
          </div>
    </PageShell>
  );
}
