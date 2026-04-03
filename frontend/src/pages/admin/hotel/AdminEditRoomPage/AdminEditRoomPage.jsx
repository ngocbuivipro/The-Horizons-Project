import React from "react";
import SidebarAdmin from "../../../../components/Utils/SidebarAdmin/SidebarAdmin.jsx";
import HeaderAdmin from "../../../../components/Utils/HeaderAdmin/HeaderAdmin.jsx";
import AdminEditRoomDetail from "../../../../components/Admin/hotel/AdminEditRoomDetail/AdminEditRoomDetail.jsx";

const AdminEditRoomPage = () => {
  return (
    <>
      <div className="flex">
        <SidebarAdmin />
        <div className="w-full">
          {/* <AdminCreateBusPage/> */}
          {/*<HeaderAdmin />*/}

          <AdminEditRoomDetail />
        </div>
      </div>
    </>
  );
};

export default AdminEditRoomPage;
