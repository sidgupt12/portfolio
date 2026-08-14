import { ModernPortfolio } from "@/components/ModernPortfolio";
import { SignatureCurtain } from "@/components/SignatureCurtain";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="relative">
      <SignatureCurtain />
      <ThemeToggle />
      <ModernPortfolio />
    </div>
  );
};

export default Index;
