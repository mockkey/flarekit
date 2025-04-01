import FAQ from "~/components/marketing/landing/FAQ";
import Features from "~/components/marketing/landing/features";
import HreoSection from "~/components/marketing/landing/hreo-section";
import Pricing from "~/components/marketing/landing/pricing";



export default function Landing() {
    return (
      <div>
        <HreoSection />
        <Features />
        <Pricing />
        <FAQ />
      </div>
    )
  }
  