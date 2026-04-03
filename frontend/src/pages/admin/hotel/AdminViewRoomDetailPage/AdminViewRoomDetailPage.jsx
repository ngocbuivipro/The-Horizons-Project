import React from 'react'
import SidebarAdmin from '../../../../components/Utils/SidebarAdmin/SidebarAdmin.jsx'
import HeaderAdmin from '../../../../components/Utils/HeaderAdmin/HeaderAdmin.jsx'
import AdminViewRoomDetail from '../../../../components/Admin/hotel/AdminViewHotelDetail/AdminViewRoomDetail.jsx'

const AdminViewRoomDetailPage = () => {
  return (
    <>
     
    <div className="flex">
        <SidebarAdmin />
        <div className="w-full">
            {/* <AdminCreateBusPage/> */}
            <HeaderAdmin/>

            <AdminViewRoomDetail/>
        
            
        
            
        </div>
    </div>
    </>

 )
}

export default AdminViewRoomDetailPage
