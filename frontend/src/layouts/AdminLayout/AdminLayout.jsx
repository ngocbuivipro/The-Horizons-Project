import { useState } from "react";
import SidebarAdmin from "../../components/Utils/SidebarAdmin/SidebarAdmin.jsx";


const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <SidebarAdmin isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Nội dung */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 md:ml-[200px]`}
        style={{ minWidth: 0 }}
      >
        {/*<HeaderAdmin />*/}
        <div className="p-2 flex-1 overflow-x-auto bg-gray-50">
          <div className="min-w-full max-h-screen">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
