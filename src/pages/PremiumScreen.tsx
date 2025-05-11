
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import SquigglyHeading from "@/components/SquigglyHeading";
import { useDrawContext } from "@/context/DrawContext";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const PremiumScreen: React.FC = () => {
  const navigate = useNavigate();
  const { generatedImage } = useDrawContext();
  const [selectedFeature, setSelectedFeature] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const premiumFeatures = [
    {
      emoji: "🧽",
      title: "Remove Watermark",
      description: "Get clean images without our logo",
      color: "bg-draw-pink",
      price: "$2.99",
      status: "available",
      productId: "remove-watermark"
    },
    {
      emoji: "🖼️",
      title: "Order Framed Print",
      description: "Get a beautiful framed print delivered",
      color: "bg-draw-turquoise",
      price: "$19.99",
      status: "available",
      productId: "framed-print"
    },
    {
      emoji: "🧸",
      title: "Turn into a Real Toy",
      description: "Have your drawing made into a stuffed toy",
      color: "bg-draw-purple",
      price: "$39.99",
      status: "coming-soon",
      productId: "stuffed-toy"
    }
  ];
  
  const handlePremiumFeature = (feature: string, status: string, productId: string) => {
    if (status === "coming-soon") {
      toast({
        title: "Coming Soon!",
        description: `The ${feature} feature will be available soon. Stay tuned!`,
      });
      return;
    }
    
    setSelectedFeature(feature);
    setDialogOpen(true);
  };
  
  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      const selectedProduct = premiumFeatures.find(f => f.title === selectedFeature);
      
      if (!selectedProduct) {
        throw new Error("Selected product not found");
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { productId: selectedProduct.productId },
      });
      
      if (error) {
        throw error;
      }
      
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setDialogOpen(false);
    }
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
              className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all relative"
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
                    onClick={() => handlePremiumFeature(feature.title, feature.status, feature.productId)}
                  >
                    {feature.status === "coming-soon" ? "Soon" : feature.price}
                  </PrimaryButton>
                </div>
              </div>
              
              {feature.status === "coming-soon" && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2">
                  <span className="bg-draw-yellow text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    Coming Soon
                  </span>
                </div>
              )}
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
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase {selectedFeature}</DialogTitle>
            <DialogDescription>
              {selectedFeature === "Remove Watermark" ? (
                "Get your image without our logo for just $2.99"
              ) : selectedFeature === "Order Framed Print" ? (
                "Get your drawing professionally framed and delivered to your door for $19.99"
              ) : (
                "Turn your creation into a physical toy for $39.99"
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            {generatedImage && (
              <div className="border-4 border-white rounded-lg shadow-md overflow-hidden w-24 h-24">
                <img 
                  src={generatedImage} 
                  alt="Your creation" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-medium">{selectedFeature}</p>
              <p className="text-sm text-gray-500">One-time purchase</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <PrimaryButton
              color="yellow"
              className="flex-1"
              onClick={() => setDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </PrimaryButton>
            <PrimaryButton
              color="purple"
              className="flex-1"
              onClick={handlePayment}
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                    Proceed to Payment
                  </>
                )}
              </div>
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PremiumScreen;
