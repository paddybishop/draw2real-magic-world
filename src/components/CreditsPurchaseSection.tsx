
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import PrimaryButton from '@/components/PrimaryButton';
import { useCredits } from '@/context/CreditsContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const CreditsPurchaseSection: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState([1]); // Default to £1
  const { credits } = useCredits();
  const { user } = useAuth();

  const creditOptions = [
    { price: 1, credits: 10, description: "Perfect for trying out" },
    { price: 5, credits: 50, description: "Great for getting started" },
    { price: 10, credits: 100, description: "Most popular choice" },
    { price: 20, credits: 200, description: "Best value for power users" }
  ];

  const currentOption = creditOptions[selectedValue[0]];

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase credits",
        variant: "destructive"
      });
      return;
    }

    try {
      const priceId = `price_${currentOption.price}`;
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

  return (
    <div className="w-full space-y-4">
      <h3 className="text-xl font-bold text-center">Buy Credits</h3>
      <div className="text-center">
        <p className="text-lg font-semibold text-draw-purple">You have {credits} credits</p>
        <p className="text-sm text-gray-600 mt-1">Each credit generates one AI image (£0.10 per image)</p>
      </div>
      
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-draw-purple">
                £{currentOption.price} = {currentOption.credits} Credits
              </h4>
              <p className="text-sm text-gray-600">{currentOption.description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>£1 (10 credits)</span>
                <span>£5 (50 credits)</span>
                <span>£10 (100 credits)</span>
                <span>£20 (200 credits)</span>
              </div>
              
              <Slider
                value={selectedValue}
                onValueChange={setSelectedValue}
                max={3}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            
            <PrimaryButton 
              color="purple" 
              className="w-full"
              onClick={handlePurchase}
            >
              Buy {currentOption.credits} Credits for £{currentOption.price}
            </PrimaryButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditsPurchaseSection;
