
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import { useDrawContext } from "@/context/DrawContext";
import Confetti from "@/components/Confetti";

const PaymentSuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setIsWatermarkRemoved } = useDrawContext();
  const [searchParams] = useSearchParams();
  const product = searchParams.get("product");
  
  useEffect(() => {
    // Process the successful payment based on the product
    if (product === "remove-watermark") {
      setIsWatermarkRemoved(true);
    }
  }, [product, setIsWatermarkRemoved]);
  
  const handleContinue = () => {
    navigate("/result");
  };
  
  return (
    <Layout title="Payment Successful" showBackButton={false}>
      <Confetti />
      
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
          
          {product === "remove-watermark" ? (
            <p className="text-gray-600 mb-4">
              Your image has been updated and the watermark has been removed.
            </p>
          ) : (
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
          )}
          
          <PrimaryButton
            color="purple"
            onClick={handleContinue}
            className="w-full"
          >
            Continue to Your Image
          </PrimaryButton>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccessScreen;
