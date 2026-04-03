import SidebarAdmin from '../../../components/Utils/SidebarAdmin/SidebarAdmin';
import AdminAboutEditor from '../../../components/Admin/AdminAboutEditor/AdminAboutEditor';

const AdminAboutPage = () => {
    return (
        <div className='flex'>
            <SidebarAdmin />
            <div className='flex-1 py-5'>
                <AdminAboutEditor />
            </div>
        </div>
    );
};

export default AdminAboutPage;