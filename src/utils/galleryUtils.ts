
export const downloadImage = async (imageUrl: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Create a download link and trigger it
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;
    downloadLink.click();
    
    // Clean up
    URL.revokeObjectURL(downloadLink.href);
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
};
