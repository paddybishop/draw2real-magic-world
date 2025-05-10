
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import SquigglyHeading from "@/components/SquigglyHeading";
import { toast } from "@/components/ui/use-toast";

const PremiumScreen: React.FC = () => {
  const navigate = useNavigate();
  
  const premiumFeatures = [
    {
      emoji: "🧽",
      title: "Remove Watermark",
      description: "Get clean images without our logo",
      color: "bg-draw-pink",
      price: "$2.99"
    },
    {
      emoji: "🖼️",
      title: "Order Framed Print",
      description: "Get a beautiful framed print delivered",
      color: "bg-draw-turquoise",
      price: "$19.99"
    },
    {
      emoji: "🧸",
      title: "Turn into a Real Toy",
      description: "Have your drawing made into a stuffed toy",
      color: "bg-draw-purple",
      price: "$39.99"
    }
  ];
  
  const handlePremiumFeature = (feature: string) => {
    toast({
      title: "Premium Feature",
      description: `This would unlock the ${feature} feature after payment.`,
    });
  };
  
  const handleBackToShare = () => {
    navigate("/result");
  };
  
  return (
    <Layout title="Premium Features" showBackButton backPath="/result">
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-6">
        <div className="w-full text-center mb-2">
          <SquigglyHeading colors="from-draw-purple via-draw-pink to-draw-turquoise">
            Upgrade Your Creation
          </SquigglyHeading>
        </div>
        
        <div className="w-full flex flex-col gap-4">
          {premiumFeatures.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center">
                <div className={`${feature.color} w-16 h-16 rounded-xl flex items-center justify-center text-3xl`}>
                  {feature.emoji}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.description}</p>
                </div>
                <div className="ml-2">
                  <PrimaryButton
                    color={index === 0 ? "pink" : index === 1 ? "turquoise" : "purple"}
                    size="small"
                    onClick={() => handlePremiumFeature(feature.title)}
                  >
                    {feature.price}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 w-full">
          <div className="border-t border-gray-200 pt-4">
            <PrimaryButton
              color="yellow"
              className="w-full"
              onClick={handleBackToShare}
            >
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Back to Free Sharing
              </div>
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PremiumScreen;
