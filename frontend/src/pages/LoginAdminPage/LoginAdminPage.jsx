import { useEffect, useState } from 'react';
import { Form, Input, Button, ConfigProvider } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { loginAdminApi } from '../../api/client/api';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdminAction } from '../../redux/actions/AdminAction';

const LoginAdminPage = () => {
    const dispatch = useDispatch();
    const { isAdmin } = useSelector(state => state.AdminReducer);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isAdmin) {
            navigate("/dashboard");
        }
    }, [isAdmin, navigate]);

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const res = await loginAdminApi(values);
            if (res.success) {
                toast.success(res.message);
                dispatch(loginAdminAction(res.data));
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("An error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#4F46E5', // Indigo-600
                    borderRadius: 8,
                },
            }}
        >
            <div className="min-h-screen flex w-full bg-white">

                {/* LEFT SIDE: DECORATIVE / BRANDING */}
                <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
                    {/* Abstract Background Design */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-slate-900 z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                        alt="Office"
                        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                    />

                    <div className="relative z-20 p-12 text-white">
                        <div className="mb-6">
                            {/* Placeholder Logo Icon */}
                            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/50">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight">Admin Horizons</h1>
                        </div>
                        <p className="text-lg text-slate-300 max-w-md leading-relaxed">
                            Welcome back. Please access the dashboard to manage users, bookings, and system settings securely.
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE: FORM */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-white">
                    <div className="w-full max-w-md space-y-8">

                        {/* Mobile Logo (Visible only on small screens) */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                        </div>

                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                                Sign in to Dashboard
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Enter your credentials to access the admin panel.
                            </p>
                        </div>

                        <Form
                            onFinish={handleFinish}
                            layout="vertical"
                            className="mt-8 space-y-6"
                            size="large"
                            requiredMark={false}
                        >
                            {/* Email */}
                            <Form.Item
                                name="email"
                                label={<span className="font-semibold text-gray-700">Email Address</span>}
                                rules={[
                                    { required: true, message: "Please enter your email" },
                                    { type: 'email', message: "Please enter a valid email" }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined className="text-gray-400 mr-2" />}
                                    placeholder="admin@company.com"
                                    className="hover:border-indigo-500 focus:border-indigo-500"
                                />
                            </Form.Item>

                            {/* Password */}
                            <Form.Item
                                name="password"
                                label={<span className="font-semibold text-gray-700">Password</span>}
                                rules={[{ required: true, message: "Please enter your password" }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-gray-400 mr-2" />}
                                    placeholder="••••••••"
                                />
                            </Form.Item>

                            {/* Remember Me & Forgot Password */}
                            {/*<div className="flex items-center justify-between">*/}
                            {/*    <Form.Item name="remember" valuePropName="checked" noStyle>*/}
                            {/*        <Checkbox className="text-gray-600">Remember me</Checkbox>*/}
                            {/*    </Form.Item>*/}
                            {/*    <a className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline cursor-pointer">*/}
                            {/*        Forgot password?*/}
                            {/*    </a>*/}
                            {/*</div>*/}

                            {/* Login Button */}
                            <Form.Item className="mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    size="large"
                                    className="bg-indigo-600 hover:bg-indigo-500 h-12 font-semibold text-md shadow-md shadow-indigo-200"
                                    icon={!loading && <ArrowRightOutlined />}
                                >
                                    Sign in
                                </Button>
                            </Form.Item>

                            {/* Back to Home Button */}
                            <Form.Item>
                                <Button
                                    type="default"
                                    onClick={() => navigate('/')}
                                    block
                                    size="large"
                                    className="h-12 font-semibold"
                                    icon={<HomeOutlined />}
                                >
                                    Go to Home Page
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className="text-center mt-6">
                            <p className="text-xs text-gray-400">
                                &copy; {new Date().getFullYear()} Admin Horizons. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default LoginAdminPage;