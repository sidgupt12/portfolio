import { ModernPortfolio } from "@/components/ModernPortfolio";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="relative">
      <ThemeToggle />
      <ModernPortfolio />
    </div>
  );
};

export default Index;
