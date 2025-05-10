
import React from "react";

interface ApiKeyInputProps {
  apiKeyInput: string;
  setApiKeyInput: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKeyInput, setApiKeyInput }) => {
  return (
    <div className="w-full mb-4">
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">OpenAI API Key Required</h3>
        <p className="text-sm text-gray-600 mb-3">
          Enter your OpenAI API key to transform your drawing. 
          The key will only be stored for this session.
        </p>
        <input
          type="password"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="sk-..."
          className="w-full px-3 py-2 border rounded-md mb-2"
        />
        <p className="text-xs text-gray-500">
          Your API key is only used for this request and is never stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyInput;
