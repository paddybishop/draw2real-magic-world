import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read a test image and convert it to base64
const imagePath = path.join(__dirname, 'test-image.png');
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = imageBuffer.toString('base64');

// Make the request to the edge function
fetch('https://nrrtzvmvgtbjomdxlufl.supabase.co/functions/v1/generate-image', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ycnR6dm12Z3Riam9tZHhsdWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDg1MjEsImV4cCI6MjA2MjQ4NDUyMX0.ERVHpyX6KMuZy85BhIjskXaD3o5FwbpVMS9JUeZhcvY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    imageBase64: `data:image/png;base64,${base64Image}`,
    bucketName: 'generated-images'
  })
})
.then(response => response.json())
.then(data => console.log('Response:', data))
.catch(error => console.error('Error:', error)); 