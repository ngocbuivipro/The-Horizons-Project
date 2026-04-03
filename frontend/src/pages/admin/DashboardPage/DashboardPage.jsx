import React from 'react'
import Dashboard from '../../../components/Admin/Dashboard/Dashboard.jsx'
import SidebarAdmin from '../../../components/Utils/SidebarAdmin/SidebarAdmin.jsx'

const DashboardPage = () => {
  return (
    <>
        <div className="flex">
            <SidebarAdmin/>
            {/* <div className="homeContainer">
                <Navbar />
                <div className="widgets">
                <Widget type="user" />
                <Widget type="order" />
                <Widget type="earning" />
                <Widget type="balance" />
                </div>
                <div className="charts">
                <Featured />
                <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
                </div>
                <div className="listContainer">
                <div className="listTitle">Latest Transactions</div>
                <Table />
                </div>
            </div> */}
            <div className='w-full mb-12'>
              <Dashboard/>
            </div>
        </div>
        
    </>
  )
}

export default DashboardPage
