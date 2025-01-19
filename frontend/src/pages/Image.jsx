import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CattleTracker = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [matchedCattle, setMatchedCattle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const GEMINI_API_KEY = 'AIzaSyDdK7ukD2lO9kli33tX1v0wv1RBzbxhAgY';

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
      processImage(file);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const checkDatabaseMatches = async (extractedPairs) => {
    try {
      const names = extractedPairs.map(pair => pair.name);
      
      const response = await fetch('http://localhost:8080/api/cattle/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ names }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch database matches');
      }

      const { data } = await response.json();
      
      // Combine extracted values with database records
      const matchedResults = extractedPairs.map(pair => {
        const dbMatch = data.find(cattle => 
          cattle.name.toLowerCase() === pair.name.toLowerCase()
        );
        return {
          ...pair,
          matched: !!dbMatch,
          cattleId: dbMatch?._id,
          dbData: dbMatch
        };
      });

      setMatchedCattle(matchedResults);
      
      // If we have matches and values, update the production data
      const updates = matchedResults
        .filter(cattle => cattle.matched && cattle.value)
        .map(cattle => ({
          cattleId: cattle.cattleId,
          amount: cattle.value
        }));

      if (updates.length > 0) {
        await updateProductionData(updates);
      }
    } catch (err) {
      setError('Failed to check database matches: ' + err.message);
      console.error('Database matching error:', err);
    }
  };

  const updateProductionData = async (updates) => {
    try {
      const response = await fetch('http://localhost:8080/api/cattle/production/batch-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update production data');
      }

      // Could handle the response here if needed
    } catch (err) {
      setError('Failed to update production data: ' + err.message);
      console.error('Production update error:', err);
    }
  };

  const processImage = async (file) => {
    setIsLoading(true);
    setError(null);
    setMatchedCattle(null);
    
    try {
      const base64Image = await convertToBase64(file);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Extract cattle names and their corresponding numerical values from this image. Return only the data in this format: name = value. For example: Pinki = 2"
            }, {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }]
          }],
          generation_config: {
            temperature: 0.1,
            max_output_tokens: 200
          },
          safety_settings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to process image');
      }

      const content = data.candidates[0].content.parts[0].text;
      const extractedPairs = content
        .split('\n')
        .filter(line => line.includes('='))
        .map(line => {
          const [name, value] = line.split('=').map(str => str.trim());
          return {
            name,
            value: parseInt(value, 10) || 0
          };
        })
        .filter(item => !isNaN(item.value));

      setExtractedData(extractedPairs);
      
      // Check database matches after extraction
      await checkDatabaseMatches(extractedPairs);
    } catch (err) {
      setError(err.message || 'Failed to process image. Please try again.');
      console.error('Gemini API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Cattle Health Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label 
              htmlFor="image-upload" 
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 800x400px)</p>
              </div>
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {imagePreview && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Preview</h3>
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}

          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Processing image and checking database...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {matchedCattle && matchedCattle.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Results</h3>
              <div className="grid grid-cols-1 gap-4">
                {matchedCattle.map((cattle, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{cattle.name}</div>
                        <div className="text-2xl font-bold">{cattle.value}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-sm ${
                          cattle.matched ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {cattle.matched ? 'Found in Database' : 'Not Found'}
                        </span>
                        {cattle.matched && (
                          <div className="text-sm text-gray-500 mt-1">
                            ID: {cattle.cattleId}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : matchedCattle && (
            <Alert className="mt-6">
              <AlertDescription>No valid cattle data found in the image. Please try another image.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CattleTracker;