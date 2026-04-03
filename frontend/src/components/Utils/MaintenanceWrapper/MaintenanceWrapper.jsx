import { Result } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const MaintenanceWrapper = ({ children }) => {
    const { isAdmin } = useSelector(state => state.AdminReducer);
    const { isLive, message } = useSelector(state => state.SystemReducer);

    const isMaintenance = !isAdmin && (isLive === false); // Check kỹ boolean false

    if (isMaintenance) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 py-10">
                <Result
                    icon={<WarningOutlined style={{ color: '#faad14' }} />}
                    title="System is Under Maintenance"
                    subTitle={message || "The system is currently under maintenance. Please check back later."}
                    className="bg-white p-10 rounded-2xl shadow-lg max-w-2xl mx-auto"
                />
            </div>
        );
    }

    return <>{children}</>;
};

export default MaintenanceWrapper;
