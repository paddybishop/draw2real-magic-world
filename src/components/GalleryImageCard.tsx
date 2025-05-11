
import React from "react";
import PrimaryButton from "@/components/PrimaryButton";
import { Download } from "lucide-react";

interface GalleryImageCardProps {
  original: string;
  generated: string;
  index: number;
  onDownload: (imageUrl: string, filename: string) => void;
}

const GalleryImageCard: React.FC<GalleryImageCardProps> = ({ 
  original, 
  generated, 
  index,
  onDownload 
}) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
      <div className="flex">
        <div className="w-1/2 aspect-square">
          {original ? (
            <img 
              src={original} 
              alt={`Original drawing ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
              <p className="text-sm">Original drawing</p>
            </div>
          )}
        </div>
        <div className="w-1/2 aspect-square">
          {generated ? (
            <img 
              src={generated} 
              alt={`Generated image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
              <p className="text-sm">Generating...</p>
            </div>
          )}
        </div>
      </div>
      <div className="p-3 flex justify-end">
        {generated && (
          <PrimaryButton
            color={index % 2 === 0 ? "turquoise" : "pink"}
            size="small"
            onClick={() => onDownload(generated, `generated-drawing-${index + 1}.png`)}
          >
            <div className="flex items-center justify-center gap-1">
              <Download size={16} />
              Download
            </div>
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};

export default GalleryImageCard;
