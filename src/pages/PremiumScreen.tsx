
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import { useCredits } from "@/context/CreditsContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const PremiumScreen: React.FC = () => {
  const navigate = useNavigate();
  const { credits, referralCode } = useCredits();
  const { user } = useAuth();

  const handlePurchase = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase credits",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive"
      });
    }
  };

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
        <div className="text-center">
          <p className="text-lg font-semibold text-draw-purple">You have {credits} credits</p>
          <p className="text-sm text-gray-600 mt-1">Each credit generates one AI image (£0.10 per image)</p>
        </div>

        {/* Premium Features Section */}
        <div className="w-full space-y-4">
          <h3 className="text-xl font-bold text-center">Premium Features</h3>
          
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200">
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

            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200">
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

            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200">
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
          </div>
        </div>

        {/* Buy Credits Section */}
        <div className="w-full space-y-4">
          <h3 className="text-xl font-bold text-center">Buy Credits</h3>
          
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">50 Credits</span>
                <span className="text-draw-purple font-bold">£5.00</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Perfect for getting started</p>
              <PrimaryButton 
                color="purple" 
                className="w-full"
                onClick={() => handlePurchase('price_5')}
              >
                Buy 50 Credits
              </PrimaryButton>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-draw-turquoise">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">100 Credits</span>
                <span className="text-draw-purple font-bold">£10.00</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Most popular choice</p>
              <p className="text-xs text-draw-turquoise font-semibold mb-3">Best Value!</p>
              <PrimaryButton 
                color="turquoise" 
                className="w-full"
                onClick={() => handlePurchase('price_10')}
              >
                Buy 100 Credits
              </PrimaryButton>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">200 Credits</span>
                <span className="text-draw-purple font-bold">£20.00</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">For power users</p>
              <PrimaryButton 
                color="purple" 
                className="w-full"
                onClick={() => handlePurchase('price_20')}
              >
                Buy 200 Credits
              </PrimaryButton>
            </div>
          </div>
        </div>

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
