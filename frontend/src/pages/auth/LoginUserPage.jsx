import { useState, useEffect } from 'react';
import { Form, Input, Button, ConfigProvider, Divider } from 'antd';
import {
    MailOutlined,
    LockOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginApi } from '../../api/client/api';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { loginUserAction } from '../../redux/actions/UserAction';
import axios from 'axios';

const LoginUserPage = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';
    const { isAuthenticated } = useSelector(state => state.UserReducer);
    const [loading, setLoading] = useState(false);

    // ================= AUTO REDIRECT =================
    useEffect(() => {
        if (isAuthenticated) navigate(from);
    }, [isAuthenticated, navigate, from]);

    // ================= NORMAL LOGIN =================
    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const res = await loginApi(values);
            if (res?.success) {
                localStorage.setItem('accessToken', res.token);
                dispatch(loginUserAction(res.data));
                toast.success('Login successful!');
                navigate(from);
            } else {
                toast.error(res?.message || 'Login failed');
            }
        } catch {
            toast.error('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    // ================= GOOGLE LOGIN BACKEND =================
    const handleGoogleBackend = async (accessToken) => {
        try {
            const res = await axios.post(
                "http://localhost:8080/api/users/google",
                { token: accessToken },
                { withCredentials: true }
            );

            localStorage.setItem('accessToken', res.data.token);
            dispatch(loginUserAction(res.data.data));
            toast.success("Google login successful!");
            navigate(from);
        } catch (error) {
            console.error(error);
            toast.error("Google authentication failed");
        }
    };

    // ================= INIT GOOGLE POPUP =================
    useEffect(() => {

        if (!window.google) return;

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: "449675269221-miniudkfckt35aq34svbc5m4nrun0rat.apps.googleusercontent.com",
            scope: "openid email profile",
            callback: (response) => {
                if (response?.access_token) {
                    handleGoogleBackend(response.access_token);
                }
            }
        });

        window.googleTokenClient = tokenClient;

    }, []);

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#10b981', borderRadius: 10 } }}>
            <div className="min-h-screen flex w-full">

                {/* LEFT — decorative panel */}
                <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-slate-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-slate-900 z-10" />

                    <img
                        src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1400&q=80"
                        alt="Resort"
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />

                    <div className="relative z-20 p-12 text-white max-w-lg">
                        <div className="mb-6">
                            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-emerald-500/50">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                            </div>

                            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                                The<br />Horizons
                            </h1>
                        </div>

                        <p className="text-lg text-slate-300 leading-relaxed">
                            Log in to discover and book at the best hotels and tours in Vietnam.
                        </p>

                        <div className="mt-8 flex gap-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex-1 text-center">
                                <p className="text-2xl font-bold text-emerald-400">500+</p>
                                <p className="text-sm text-slate-300 mt-1">Accommodations</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex-1 text-center">
                                <p className="text-2xl font-bold text-emerald-400">100+</p>
                                <p className="text-sm text-slate-300 mt-1">Amazing tours</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex-1 text-center">
                                <p className="text-2xl font-bold text-emerald-400">50K+</p>
                                <p className="text-sm text-slate-300 mt-1">Customers</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT — login form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
                    <div className="w-full max-w-md space-y-8">

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Welcome back!
                            </h2>
                            <p className="mt-2 text-gray-500">
                                Sign in to continue your travel journey.
                            </p>
                        </div>

                        <Form
                            onFinish={handleFinish}
                            layout="vertical"
                            size="large"
                            requiredMark={false}
                        >
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter your email' },
                                    { type: 'email', message: 'Invalid email address' }
                                ]}
                            >
                                <Input prefix={<MailOutlined />} />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[{ required: true }]}
                            >
                                <Input.Password prefix={<LockOutlined />} />
                            </Form.Item>

                            <Form.Item className="mb-0 mt-2">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    size="large"
                                    className="h-12 font-semibold bg-emerald-500 hover:bg-emerald-600 border-0"
                                    icon={!loading && <ArrowRightOutlined />}
                                >
                                    Sign in
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider>Or continue with</Divider>

                        <Button
                            block
                            size="large"
                            className="h-12 font-semibold bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 flex items-center justify-center gap-2 shadow-sm rounded-lg"
                            onClick={() =>
                                window.googleTokenClient?.requestAccessToken()
                            }
                        >
                            <img
                                src="https://developers.google.com/identity/images/g-logo.png"
                                alt="Google"
                                className="w-5 h-5"
                            />
                            Sign in with Google
                        </Button>

                        <Divider className="text-gray-400 text-sm">
                            Don't have an account?
                        </Divider>

                        <Button
                            block
                            size="large"
                            onClick={() => navigate('/register')}
                            className="h-12 font-semibold border-emerald-400 text-emerald-600"
                        >
                            Create a free account
                        </Button>

                        <p className="text-center text-sm text-gray-400">
                            <Link to="/" className="text-emerald-600 hover:underline">
                                ← Back to Home
                            </Link>
                        </p>

                    </div>
                </div>

            </div>
        </ConfigProvider>
    );
};

export default LoginUserPage;