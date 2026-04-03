import React, { useState } from "react";
import SidebarAdmin from "../../../components/Utils/SidebarAdmin/SidebarAdmin.jsx";
import HeaderAdmin from "../../../components/Utils/HeaderAdmin/HeaderAdmin.jsx";
import AdminViewOrders from "../../../components/Admin/AdminViewOrders/AdminViewOrders.jsx";

const AdminViewOrdersPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AdminViewOrders />
  );
};

export default AdminViewOrdersPage;
