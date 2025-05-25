
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface CreditsContextType {
  credits: number;
  isLoading: boolean;
  refreshCredits: () => Promise<void>;
  deductCredit: () => Promise<boolean>;
  addCredits: (amount: number, type: string, description?: string) => Promise<void>;
  referralCode: string | null;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const CreditsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshCredits = async () => {
    if (!user) {
      setCredits(0);
      setReferralCode(null);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch current credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') {
        throw creditsError;
      }

      // Fetch referral code
      const { data: referralData, error: referralError } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .single();

      if (referralError && referralError.code !== 'PGRST116') {
        throw referralError;
      }

      setCredits(creditsData?.credits || 0);
      setReferralCode(referralData?.code || null);
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast({
        title: "Error",
        description: "Failed to fetch credits",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deductCredit = async (): Promise<boolean> => {
    if (!user || credits <= 0) {
      return false;
    }

    try {
      // Deduct credit
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          credits: credits - 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -1,
          type: 'usage',
          description: 'AI image generation'
        });

      if (transactionError) throw transactionError;

      setCredits(credits - 1);
      return true;
    } catch (error) {
      console.error('Error deducting credit:', error);
      toast({
        title: "Error",
        description: "Failed to deduct credit",
        variant: "destructive"
      });
      return false;
    }
  };

  const addCredits = async (amount: number, type: string, description?: string) => {
    if (!user) return;

    try {
      // Add credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          credits: credits + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          type: type,
          description: description || `Added ${amount} credits`
        });

      if (transactionError) throw transactionError;

      setCredits(credits + amount);
      
      toast({
        title: "Credits Added",
        description: `Added ${amount} credits to your account`,
      });
    } catch (error) {
      console.error('Error adding credits:', error);
      toast({
        title: "Error",
        description: "Failed to add credits",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    refreshCredits();
  }, [user]);

  return (
    <CreditsContext.Provider value={{
      credits,
      isLoading,
      refreshCredits,
      deductCredit,
      addCredits,
      referralCode
    }}>
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = (): CreditsContextType => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
};
