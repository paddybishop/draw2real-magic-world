
import React from "react";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";
import { useNavigate } from "react-router-dom";

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();
  
  const steps = [
    {
      title: "Draw Something Fun",
      description: "Use paper and crayons or markers to create a drawing of anything you imagine!",
      icon: "✏️",
      color: "bg-draw-yellow"
    },
    {
      title: "Take a Photo",
      description: "Use our app to take a clear photo of your drawing",
      icon: "📸",
      color: "bg-draw-pink"
    },
    {
      title: "Make it Real",
      description: "Our magic AI turns your drawing into a realistic image",
      icon: "✨",
      color: "bg-draw-turquoise"
    },
    {
      title: "Share & Enjoy",
      description: "Share your creation with friends and family",
      icon: "🎉",
      color: "bg-draw-purple"
    }
  ];
  
  return (
    <Layout title="How It Works" showBackButton>
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-6">
        <div className="w-full flex flex-col gap-6">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex items-start"
            >
              <div className={`${step.color} w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0`}>
                {step.icon}
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 w-full">
          <PrimaryButton
            color="pink"
            className="w-full"
            onClick={() => navigate("/camera")}
          >
            Let's Try It!
          </PrimaryButton>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;
