
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import Confetti from "@/components/Confetti";
import { useCredits } from "@/context/CreditsContext";

const PaymentSuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(true);
  const { addCredits, credits } = useCredits();
  
  const creditsAdded = searchParams.get('credits');

  useEffect(() => {
    // Add credits if they were purchased
    if (creditsAdded) {
      const amount = parseInt(creditsAdded);
      if (amount > 0) {
        addCredits(amount, 'purchase', `Purchased ${amount} credits`);
      }
    }

    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [creditsAdded, addCredits]);

  return (
    <Layout title="Payment Successful!" showBackButton={false}>
      {showConfetti && <Confetti />}
      
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
          {creditsAdded && (
            <p className="text-lg text-gray-700">
              {creditsAdded} credits have been added to your account
            </p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            You now have {credits} credits available
          </p>
        </div>

        <div className="flex gap-3">
          <PrimaryButton
            color="purple"
            onClick={() => navigate("/camera")}
          >
            Create New Image
          </PrimaryButton>
          
          <PrimaryButton
            color="turquoise"
            onClick={() => navigate("/gallery")}
          >
            View Gallery
          </PrimaryButton>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccessScreen;
