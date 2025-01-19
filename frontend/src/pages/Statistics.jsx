import React, { useEffect, useState } from 'react';
import { GetAllEmployees } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
  Users, Building, BadgeDollarSign, TrendingUp,
  Droplet, Scale, Calendar, AlertTriangle
} from 'lucide-react';

const Statistics = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      const data = await GetAllEmployees('', 1, 1000);
      setEmployees(data.employees);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const calculateStats = () => {
    if (!employees.length) return null;

    // Breed distribution
    const breedCount = employees.reduce((acc, emp) => {
      acc[emp.Breed] = (acc[emp.Breed] || 0) + 1;
      return acc;
    }, {});

    // Defect analysis
    const defectCount = employees.reduce((acc, emp) => {
      acc[emp.Defect] = (acc[emp.Defect] || 0) + 1;
      return acc;
    }, {});

    // Production trends (assuming production data exists)
    const productionData = employees.flatMap(emp =>
      emp.production?.map(p => ({
        date: new Date(p.date).toLocaleDateString(),
        amount: p.amount,
        breed: emp.Breed
      })) || []
    );

      // Average production per breed
  const breedProduction = employees.reduce((acc, emp) => {
    if (!acc[emp.Breed]) acc[emp.Breed] = { total: 0, count: 0 };
    const lastProduction = emp.production?.[emp.production.length - 1]?.amount || 0;
    acc[emp.Breed].total += lastProduction;
    acc[emp.Breed].count += 1;
    return acc;
  }, {});

  const avgBreedProduction = Object.entries(breedProduction).map(([breed, data]) => ({
    breed,
    avgProduction: data.total / data.count,
  }));

    // Age vs Weight correlation
    const ageWeightData = employees.map(emp => ({
      age: Number(emp.Age),
      weight: Number(emp.Weight),
      breed: emp.Breed
    }));

    // Monthly production averages
    const monthlyProduction = productionData.reduce((acc, prod) => {
      const month = prod.date;
      if (!acc[month]) acc[month] = { date: month, total: 0, count: 0 };
      acc[month].total += prod.amount;
      acc[month].count += 1;
      return acc;
    }, {});


    return {
      totalCattle: employees.length,
      breedData: Object.entries(breedCount).map(([Breed, count]) => ({ Breed, count })),
      defectData: Object.entries(defectCount).map(([defect, count]) => ({ defect, count })),
      productionData,
      ageWeightData,
       avgBreedProduction,
      averageAge: employees.reduce((sum, emp) => sum + Number(emp.Age), 0) / employees.length,
      averageWeight: employees.reduce((sum, emp) => sum + Number(emp.Weight), 0) / employees.length,
      totalProduction: productionData.reduce((sum, p) => sum + p.amount, 0),
      breeds: Object.keys(breedCount).length,
    };
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading statistics...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

  const stats = calculateStats();
  if (!stats) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];
const groupByBreed = () => {
  const groups = {};
  employees.forEach((employee) => {
    if (!groups[employee.Breed]) {
      groups[employee.Breed] = [];
    }
    groups[employee.Breed].push(employee);
  });
  return groups;
};

const breedGroups = groupByBreed();
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Cattle Statistics Dashboard</h1>
      
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cattle</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCattle}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Production</CardTitle>
            <Droplet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.totalProduction)} L
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.averageAge)} years
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Weight</CardTitle>
            <Scale className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.averageWeight)} kg
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breed Distribution */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Breed Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.breedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Breed" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8">
                    {stats.breedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Average Breed Production */}
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Average Breed Production</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.avgBreedProduction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="breed" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgProduction" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>

        {/* Health Issues Distribution */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Health Issues Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.defectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.defectData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breed Table */}
   <Card className="shadow-xl">
      <CardContent className='bg-gradient-to-bl from-slate-50 to-slate-300 p-6 rounded-lg'>
        <div className="overflow-x-auto">
          {Object.entries(breedGroups).map(([breed, breedEmployees]) => (
            <div key={breed} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b-2 border-blue-500 pb-2 text-center">{breed}</h2>
              <table className="min-w-full bg-white border-collapse border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
                  <tr>
                    <th className="px-6 py-4 text-white font-semibold border border-blue-400 text-center">Name</th>
                    <th className="px-6 py-4 text-white font-semibold border border-blue-400 text-center">Breed</th>
                    <th className="px-6 py-4 text-white font-semibold border border-blue-400 text-center">Age (Years)</th>
                    <th className="px-6 py-4 text-white font-semibold border border-blue-400 text-center">Weight (kg)</th>
                    <th className="px-6 py-4 text-white font-semibold border border-blue-400 text-center">Health Issues</th>
                    <th className="px-6 py-4 text-white font-semibold border border-blue-400 text-center">Last Production</th>
                  </tr>
                </thead>
                <tbody>
                  {breedEmployees.map((employee) => (
                    <tr 
                      key={employee._id} 
                      className="hover:bg-blue-50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="border px-6 py-4 text-center">{employee.name}</td>
                      <td className="border px-6 py-4 text-center">{employee.Breed}</td>
                      <td className="border px-6 py-4 text-center">{employee.Age}</td>
                      <td className="border px-6 py-4 text-center">{employee.Weight}</td>
                      <td className="border px-6 py-4 text-center">{employee.Defect}</td>
                      <td className="border px-6 py-4 text-center">
                        {employee.production?.[employee.production.length - 1]?.amount || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default Statistics;