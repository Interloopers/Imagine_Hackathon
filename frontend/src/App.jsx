import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import EmployeeManagementApp from './Elements/EmployeeManagementApp';
import EmployeeDetails from './Elements/EmployeeDetails';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Statistics from './pages/Statistics';
import Feature from './pages/Feature';
import Image from './pages/Image'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Dashboard routes with Sidebar */}
        <Route
          path="/dashboard/*"
          element={
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-8 bg-slate-50 min-h-screen">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard/employee" />} />
                  <Route path="employee" element={<EmployeeManagementApp />} />
                  <Route path="employee/:id" element={<EmployeeDetails />} />
                  <Route path="feature" element={<Feature />} />
                  <Route path="statistics" element={<Statistics />} />
                  <Route path="Image" element={<Image />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
