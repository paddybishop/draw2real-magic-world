
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PrimaryButton from "@/components/PrimaryButton";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6 text-7xl">😕</div>
        <h1 className="text-3xl font-bold mb-4">Oops!</h1>
        <p className="text-xl mb-8">We can't find the page you're looking for.</p>
        <PrimaryButton
          color="pink"
          onClick={() => navigate("/")}
        >
          Go Back Home
        </PrimaryButton>
      </div>
    </Layout>
  );
};

export default NotFound;
