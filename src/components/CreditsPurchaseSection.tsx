
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import PrimaryButton from '@/components/PrimaryButton';
import { useCredits } from '@/context/CreditsContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const CreditsPurchaseSection: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState([0]); // Default to £1
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
      <div className="mb-3">
        <img 
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop" 
          alt="Buy credits preview" 
          className="w-full h-32 object-cover rounded-lg"
        />
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Buy Credits</span>
        <span className="text-draw-purple font-bold">You have {credits} credits</span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">Each credit generates one AI image (£0.10 per image)</p>
      
      <div className="space-y-4">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-draw-purple">
            £{currentOption.price} = {currentOption.credits} Credits
          </h4>
          <p className="text-sm text-gray-600">{currentOption.description}</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>£1</span>
            <span>£5</span>
            <span>£10</span>
            <span>£20</span>
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
    </div>
  );
};

export default CreditsPurchaseSection;
