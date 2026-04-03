import React from 'react'
import SidebarAdmin from '../../../../components/Utils/SidebarAdmin/SidebarAdmin.jsx'
import HeaderAdmin from '../../../../components/Utils/HeaderAdmin/HeaderAdmin.jsx'
import AdminViewEditHotel from '../../../../components/Admin/hotel/AdminViewEditHotel/AdminViewEditHotel.jsx'

const AdminViewEditHotelPage = () => {
  return (
    <div className="flex">
    <SidebarAdmin />
    <div className="w-full">
        {/* <AdminCreateBusPage/> */}
        {/*<HeaderAdmin/>*/}

        <AdminViewEditHotel/>
        
       
        
    </div>
</div>
  )
}

export default AdminViewEditHotelPage
