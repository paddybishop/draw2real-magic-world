
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Layout className="justify-center items-center text-center">
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-6">
        {/* App Logo */}
        <div className="animate-bounce-light mb-4">
          <div className="w-48 h-48 rounded-full bg-white flex items-center justify-center shadow-lg relative">
            <div className="absolute inset-0 rounded-full border-8 border-dashed border-draw-pink animate-spin-slow opacity-20" style={{ animationDuration: '30s' }}></div>
            <h1 className="text-4xl font-bold">
              <span className="text-draw-pink">Draw</span>
              <span className="text-draw-turquoise">2</span>
              <span className="text-draw-purple">Real</span>
            </h1>
          </div>
        </div>
        
        {/* Primary CTA */}
        <PrimaryButton
          size="large"
          color="pink"
          className="w-64 animate-wiggle"
          style={{ animationDuration: '3s' }}
          onClick={() => navigate("/camera")}
        >
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            Take a Photo of Your Drawing
          </div>
        </PrimaryButton>
        
        {/* Secondary Options */}
        <div className="flex gap-4 mt-2">
          <PrimaryButton
            color="turquoise"
            size="small"
            onClick={() => navigate("/gallery")}
          >
            <div className="flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h19.138a.2.2 0 0 1 .192.254L19.16 11.5"/>
                <path d="M2 15h15.167a.2.2 0 0 1 .192.254L15.19 21"/>
                <path d="M2 9h13.167a.2.2 0 0 1 .192.254L13.19 15"/>
              </svg>
              Gallery
            </div>
          </PrimaryButton>
          
          <PrimaryButton
            color="purple"
            size="small"
            onClick={() => navigate("/how-it-works")}
          >
            <div className="flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
              </svg>
              How it Works
            </div>
          </PrimaryButton>
        </div>
      </div>
    </Layout>
  );
};

export default WelcomeScreen;
