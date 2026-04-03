import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Avatar, Tag, Divider } from 'antd';
import {
    UserOutlined, MailOutlined, PhoneOutlined, LogoutOutlined,
    HomeOutlined, CalendarOutlined, LockOutlined
} from '@ant-design/icons';
import { logoutUserApi } from '../../api/client/api';
import { logoutUserAction } from '../../redux/actions/UserAction';
import toast from 'react-hot-toast';

const UserProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector(state => state.UserReducer);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) navigate('/login');
    }, [isAuthenticated, navigate]);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logoutUserApi();
        } catch {
            // ignore
        } finally {
            localStorage.removeItem('accessToken');
            dispatch(logoutUserAction());
            toast.success('Đã đăng xuất thành công!');
            navigate('/');
            setLoading(false);
        }
    };

    if (!user) return null;

    const joinedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
            {/* Header bar */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
                <Link to="/" className="flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700">
                    <HomeOutlined />
                    <span>Betel Hospitality</span>
                </Link>
                <Button
                    danger
                    icon={<LogoutOutlined />}
                    loading={loading}
                    onClick={handleLogout}
                    className="font-medium"
                >
                    Đăng xuất
                </Button>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Profile card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Cover */}
                    <div className="h-36 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 relative">
                        <div className="absolute inset-0 opacity-30"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
                        />
                    </div>

                    {/* Avatar */}
                    <div className="px-8 pb-8">
                        <div className="-mt-12 mb-4 flex items-end justify-between">
                            <Avatar
                                size={96}
                                src={user.avatar}
                                icon={!user.avatar && <UserOutlined />}
                                className="border-4 border-white shadow-lg bg-emerald-100 text-emerald-600"
                                style={{ fontSize: 40 }}
                            />
                            <Tag color="emerald" className="text-emerald-700 bg-emerald-50 border-emerald-200 font-medium px-3 py-1 rounded-full">
                                {user.role === 'admin' ? '👑 Admin' : '👤 Người dùng'}
                            </Tag>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900">{user.username || 'Người dùng'}</h1>
                        <p className="text-gray-500 mt-1">{user.email}</p>

                        <Divider className="my-6" />

                        <div className="space-y-4">
                            <InfoRow icon={<MailOutlined className="text-emerald-500" />} label="Email" value={user.email} />
                            <InfoRow icon={<PhoneOutlined className="text-emerald-500" />} label="Số điện thoại" value={user.phoneNumber || 'Chưa cập nhật'} />
                            <InfoRow icon={<CalendarOutlined className="text-emerald-500" />} label="Tham gia từ" value={joinedDate} />
                            <InfoRow icon={<LockOutlined className="text-emerald-500" />} label="Trạng thái" value="Đã xác minh" />
                        </div>

                        <Divider className="my-6" />

                        <div className="flex gap-3">
                            <Button
                                block
                                size="large"
                                onClick={() => navigate('/')}
                                icon={<HomeOutlined />}
                                className="h-11 font-medium border-emerald-400 text-emerald-600 hover:border-emerald-500"
                            >
                                Trang chủ
                            </Button>
                            <Button
                                block
                                size="large"
                                danger
                                onClick={handleLogout}
                                loading={loading}
                                icon={<LogoutOutlined />}
                                className="h-11 font-medium"
                            >
                                Đăng xuất
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-lg flex-shrink-0">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-gray-800 font-medium mt-0.5 truncate">{value}</p>
        </div>
    </div>
);

export default UserProfilePage;
