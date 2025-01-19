import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GetEmployeeDetailsById } from '../api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { FileDown } from 'lucide-react';
import showdown from 'showdown';

// Add converter instance
const converter = new showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});
const MonthlyReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productionData, setProductionData] = useState([]);

  const GEMINI_API_KEY = 'AIzaSyDdK7ukD2lO9kli33tX1v0wv1RBzbxhAgY';

  const fetchEmployeeDetails = async () => {
    try {
      const data = await GetEmployeeDetailsById(id);
      setEmployee(data);

      // Transform production data for the chart
      if (data.production && Array.isArray(data.production)) {
        const formattedData = data.production
          .map(item => ({
            date: format(parseISO(item.date), 'MMM dd'),
            amount: item.amount
          }))
          .sort((a, b) => parseISO(a.date) - parseISO(b.date));

        setProductionData(formattedData);
      }
      return data;
    } catch (err) {
      setError('Failed to fetch cattle data: ' + err.message);
      return null;
    }
  };

  const generateReport = async (data) => {
    if (!data) return;

    const prompt = `
      Analyze this cattle's data and provide a detailed monthly report. Focus on health, production, and recommendations.
      
      Cattle Details:
      Name: ${data.name}
      Age: ${data.Age} years
      Weight: ${data.Weight} kg
      Breed: ${data.Breed}
      Health Status/Defects: ${data.Defect || 'None reported'}
      
      Production Data for the last month:
      ${JSON.stringify(productionData)}
      
      Please provide a detailed report covering:
      1. Overall Health Assessment:
         - Analysis based on age, weight, and any reported health issues
         - Weight evaluation for the breed and age
      
      2. Production Analysis:
         - Review of milk production trends
         - Comparison with expected production for breed/age
         - Identification of any patterns or concerns
      
      3. Recommendations:
         - Specific health recommendations if needed
         - Suggestions for production improvement
         - Any preventive measures needed
      
      4. Future Outlook:
         - Expected production trends
         - Suggested monitoring points
      
      Please format the response in clear sections and provide specific, actionable insights.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      });

      const result = await response.json();
      return result.candidates[0].content.parts[0].text;
    } catch (err) {
      throw new Error('Failed to generate AI report: ' + err.message);
    }
  };

const handleGenerateReport = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await fetchEmployeeDetails();
    if (data) {
      const aiReport = await generateReport(data);
      
      // Convert markdown to HTML
      const htmlContent = converter.makeHtml(aiReport);
      
      setReport({
        data: data,
        analysis: htmlContent
      });
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

 const handlePDFExport = async () => {
    window.print(); // This will trigger the browser's print dialog which can save as PDF
  };
  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  return (
        <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6 flex gap-4">
        <Button 
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? 'Generating Report...' : 'Generate Monthly Report'}
        </Button>
        <Button 
          variant="outline"
          onClick={handlePDFExport}
          className="w-full md:w-auto"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Save as PDF
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/dashboard/employee')}
          className="w-full md:w-auto"
        >
          Back to Dashboard
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {employee && (
        <div className="space-y-6">
          {/* Basic Info Card */}
<Card className="p-6">
  <CardHeader>
    <CardTitle>Cattle Information</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left side - Image */}
      <div className="lg:w-1/2">
        <div className="relative rounded-lg overflow-hidden h-full">
          <img
            src={employee.profileImage}
            alt={`${employee.name}'s photo`}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Right side - Stats */}
      <div className="lg:w-1/2 flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500">Name</div>
            <div className="text-lg font-semibold">{employee.name}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500">Age</div>
            <div className="text-lg font-semibold">{employee.Age} years</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500">Weight</div>
            <div className="text-lg font-semibold">{employee.Weight} kg</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500">Breed</div>
            <div className="text-lg font-semibold">{employee.Breed}</div>
          </div>
        </div>
      </div>
    </div>
  </CardContent>
          </Card>
          
          {/* Production Statistics */}
{productionData.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Production Statistics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600">Average Production</div>
          <div className="text-2xl font-bold">
            {(productionData.reduce((acc, curr) => acc + curr.amount, 0) /
              productionData.length).toFixed(2)} 
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-green-600">Highest Production</div>
          <div className="text-2xl font-bold">
            {Math.max(...productionData.map(d => d.amount))} 
          </div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-sm text-purple-600">Latest Production</div>
          <div className="text-2xl font-bold">
            {productionData[productionData.length - 1]?.amount || 0} 
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)}

          {/* Production Chart */}
          {productionData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Production Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={productionData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#8884d8" 
                        name="Production"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          {report && (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Monthly Analysis Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: report.analysis }} 
          />
        </CardContent>
      </Card>
    )}
        </div>
      )}
    </div>
  );
};

export default MonthlyReport;