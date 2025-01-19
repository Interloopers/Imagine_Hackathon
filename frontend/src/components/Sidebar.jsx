import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PawPrint,
  LayoutDashboard,
  Menu,
  Image,
  Users,
  LogOut,
  BarChart2,
} from "lucide-react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard/employee",
    },
    {
      title: "Image Transcript",
      icon: <Image className="h-5 w-5" />,
      path: "/dashboard/Image",
    },
    {
      title: "Statistics",
      icon: <BarChart2 className="h-5 w-5" />,
      path: "/dashboard/statistics",
    }
  ];

  return (
    <div className="relative">
      <div
        className={`
          ${isCollapsed ? "w-20" : "w-64"} 
          min-h-screen bg-green-50 text-gray-800 transition-all duration-300 p-4 h-full border-r border-gray-300
        `}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-4 bg-green-100 rounded-full hover:bg-green-200"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-4 w-4 text-gray-700" />
        </Button>

        {/* Logo/Title */}
        <div className="flex items-center space-x-2 mb-8">
          <PawPrint className="h-8 w-8 text-green-600" />
          {!isCollapsed && <span className="text-xl font-bold text-green-800">PashuArogya</span>}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={`
                w-full justify-start space-x-3 
                ${isActive(item.path) ? "bg-green-600 text-white hover:bg-green-700" : "hover:bg-green-100"}
              `}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {!isCollapsed && <span>{item.title}</span>}
            </Button>
          ))}
        </nav>

        {/* Logout Button at Bottom */}
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 absolute bottom-4 hover:bg-green-100"
        >
          <LogOut className="h-5 w-5 text-red-600" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
