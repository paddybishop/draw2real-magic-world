
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import CreditsPurchaseSection from "@/components/CreditsPurchaseSection";
import { useCredits } from "@/context/CreditsContext";
import { toast } from "@/components/ui/use-toast";

const PremiumScreen: React.FC = () => {
  const navigate = useNavigate();
  const { referralCode } = useCredits();

  const shareReferralCode = () => {
    if (referralCode) {
      const referralUrl = `${window.location.origin}?ref=${referralCode}`;
      navigator.clipboard.writeText(referralUrl);
      toast({
        title: "Referral Link Copied",
        description: "Share this link to earn 5 credits when friends sign up and buy credits!",
      });
    }
  };

  return (
    <Layout title="Premium Features" showBackButton>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-6">
        {/* Premium Features Section */}
        <div className="w-full space-y-4">
          <h3 className="text-xl font-bold text-center">Premium Features</h3>
          
          <div className="space-y-3">
            {/* Remove Watermark */}
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200">
              <div className="mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=200&fit=crop" 
                  alt="Remove watermark preview" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Remove Watermark</span>
                <span className="text-draw-purple font-bold">Coming Soon</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Generate images without watermark</p>
              <PrimaryButton 
                color="purple" 
                className="w-full opacity-50"
                disabled
              >
                Coming Soon
              </PrimaryButton>
            </div>

            {/* High Resolution */}
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200">
              <div className="mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop" 
                  alt="High resolution preview" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">High Resolution</span>
                <span className="text-draw-purple font-bold">Coming Soon</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Generate high-resolution images</p>
              <PrimaryButton 
                color="turquoise" 
                className="w-full opacity-50"
                disabled
              >
                Coming Soon
              </PrimaryButton>
            </div>

            {/* 3D Toy Mode */}
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200">
              <div className="mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop" 
                  alt="3D toy mode preview" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">3D Toy Mode</span>
                <span className="text-draw-purple font-bold">Coming Soon</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Turn drawings into 3D toy models</p>
              <PrimaryButton 
                color="yellow" 
                className="w-full opacity-50"
                disabled
              >
                Coming Soon
              </PrimaryButton>
            </div>

            {/* Credits Purchase Section as 4th item */}
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200">
              <CreditsPurchaseSection />
            </div>
          </div>
        </div>

        {/* Referral Section */}
        {referralCode && (
          <div className="w-full bg-gradient-to-r from-draw-pink to-draw-purple rounded-lg p-4 text-white">
            <h3 className="font-bold mb-2">Earn Free Credits!</h3>
            <p className="text-sm mb-3">
              Get 5 credits for every friend who signs up and buys credits using your referral code:
            </p>
            <div className="bg-white/20 rounded px-3 py-2 mb-3">
              <code className="text-sm font-mono">{referralCode}</code>
            </div>
            <PrimaryButton 
              color="pink" 
              className="w-full"
              onClick={shareReferralCode}
            >
              Share Referral Link
            </PrimaryButton>
          </div>
        )}

        <PrimaryButton color="yellow" onClick={() => navigate('/gallery')}>
          View Gallery
        </PrimaryButton>
      </div>
    </Layout>
  );
};

export default PremiumScreen;
