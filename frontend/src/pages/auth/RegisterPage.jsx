import { useState } from 'react';
import { Form, Input, Button, ConfigProvider, Divider, Steps } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, checkTokenOtp } from '../../api/client/api';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { loginUserAction } from '../../redux/actions/UserAction';
import axios from 'axios';

const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector(state => state.UserReducer);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0); // 0 = register form, 1 = otp form
    const [registerForm] = Form.useForm();
    const [otpForm] = Form.useForm();

    useEffect(() => {
        if (isAuthenticated) navigate('/');
    }, [isAuthenticated, navigate]);

    // ================= NORMAL REGISTER =================
    const handleRegister = async (values) => {
        setLoading(true);
        try {
            const formData = {
                username: values.username,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
            };
            const res = await registerUser(formData);
            if (res?.success) {
                toast.success('OTP code has been sent to your email!');
                setStep(1);
            } else {
                toast.error(res?.message || 'Registration failed');
            }
        } catch {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (values) => {
        setLoading(true);
        try {
            const res = await checkTokenOtp({ otp: values.otp });
            if (res?.success) {
                toast.success('Registration successful! Please login.');
                navigate('/login');
            } else {
                otpForm.setFields([
                    {
                        name: 'otp',
                        errors: [res?.message || 'Invalid OTP code'],
                    },
                ]);
            }
        } catch {
            otpForm.setFields([
                {
                    name: 'otp',
                    errors: ['An error occurred. Please try again.'],
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // ================= GOOGLE REGISTER =================
    const handleGoogleBackend = async (accessToken) => {
        try {
            const res = await axios.post(
                "http://localhost:8080/api/users/google",
                { token: accessToken },
                { withCredentials: true }
            );

            localStorage.setItem('accessToken', res.data.token);
            dispatch(loginUserAction(res.data.data));
            toast.success("Google signup successful!");
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Google authentication failed");
        }
    };

    // ================= INIT GOOGLE POPUP =================
    useEffect(() => {

        if (!window.google) return;

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id:
                "449675269221-miniudkfckt35aq34svbc5m4nrun0rat.apps.googleusercontent.com",
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

                {/* LEFT panel */}
                <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-slate-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-slate-900 z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=80"
                        alt="Vietnam Resort"
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                    <div className="relative z-20 p-12 text-white max-w-lg">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/50">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-4">Join<br />with us</h1>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            Create an account to enjoy seamless booking, manage your trips, and access exclusive offers.
                        </p>
                        <ul className="mt-8 space-y-3">
                            {['Fast & Easy Booking', 'Track Your Orders', 'Receive Exclusive Offers', 'Booking History'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-slate-200">
                                    <CheckCircleOutlined className="text-emerald-400 text-lg" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* RIGHT — form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
                    <div className="w-full max-w-md space-y-6">

                        <div className="lg:hidden flex justify-center mb-2">
                            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                                <UserOutlined className="text-white text-xl" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">{step === 0 ? 'Create Account' : 'Verify Email'}</h2>
                            <p className="mt-1 text-gray-500">
                                {step === 0
                                    ? 'Fill in the information below to start.'
                                    : `Enter the OTP code sent to your email.`}
                            </p>
                        </div>
                        <div className="mb-3">
                            <Steps
                                current={step}
                                size="small"
                                items={[
                                    { title: 'Information', icon: <UserOutlined /> },
                                    { title: 'Verify OTP', icon: <SafetyOutlined /> },
                                ]}
                            />
                        </div>
                        {step === 0 ? (
                            <>
                            <Form form={registerForm} onFinish={handleRegister} layout="vertical" size="large" requiredMark={false}>
                                <Form.Item
                                    name="username"
                                    label={<span className="font-semibold text-gray-700">Username</span>}
                                    rules={[{ required: true, message: 'Please enter your username' }]}
                                >
                                    <Input prefix={<UserOutlined className="text-gray-400 mr-2" />} placeholder="John Doe" maxLength={255} />
                                </Form.Item>

                                <Form.Item
                                    name="email"
                                    label={<span className="font-semibold text-gray-700">Email</span>}
                                    rules={[
                                        { required: true, message: 'Please enter your email' },
                                        { type: 'email', message: 'Invalid email format' }
                                    ]}
                                >
                                    <Input prefix={<MailOutlined className="text-gray-400 mr-2" />} placeholder="your@email.com" />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    label={<span className="font-semibold text-gray-700">Password</span>}
                                    rules={[
                                        { required: true, message: 'Please enter a password' },
                                        { min: 6, message: 'Password must be at least 6 characters' },
                                        {
                                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/,
                                            message: 'Must contain uppercase, lowercase, number, and special character',
                                        }
                                    ]}
                                >
                                    <Input.Password prefix={<LockOutlined className="text-gray-400 mr-2" />} placeholder="E.g., StrongP@ssw0rd" />
                                </Form.Item>

                                <Form.Item
                                    name="confirmPassword"
                                    label={<span className="font-semibold text-gray-700">Confirm Password</span>}
                                    dependencies={['password']}
                                    rules={[
                                        { required: true, message: 'Please confirm your password' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) return Promise.resolve();
                                                return Promise.reject(new Error('Passwords do not match!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password prefix={<LockOutlined className="text-gray-400 mr-2" />} placeholder="Re-enter password" />
                                </Form.Item>

                                <Form.Item className="mb-0 mt-2">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        block size="large"
                                        className="h-12 font-semibold text-base bg-emerald-500 hover:bg-emerald-600 border-0 shadow-lg shadow-emerald-200"
                                    >
                                        Register Now
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
                                Register with Google
                            </Button>
                        </>

                        ) : (
                            <Form form={otpForm} onFinish={handleVerifyOtp} layout="vertical" size="large" requiredMark={false}>
                                <div className="bg-emerald-50 rounded-xl p-4 mb-4 text-sm text-emerald-700 border border-emerald-200">
                                    📧 We have sent an OTP code to your email. The code is valid for 5 minutes.
                                </div>

                                <Form.Item
                                    name="otp"
                                    label={<span className="font-semibold text-gray-700">OTP Code</span>}
                                    rules={[{ required: true, message: 'Please enter the OTP code' }]}
                                >
                                    <Input
                                        prefix={<SafetyOutlined className="text-gray-400 mr-2" />}
                                        placeholder="Enter 8-digit code"
                                        maxLength={8}
                                        className="text-center text-lg tracking-widest font-mono"
                                    />
                                </Form.Item>

                                <Form.Item className="mb-0 mt-2">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        block size="large"
                                        className="h-12 font-semibold text-base bg-emerald-500 hover:bg-emerald-600 border-0 shadow-lg shadow-emerald-200"
                                        icon={<CheckCircleOutlined />}
                                    >
                                        Verify & Complete
                                    </Button>
                                </Form.Item>
                            </Form>
    
                            
                        )}

                        <Divider className="text-gray-400 text-sm">Already have an account?</Divider>
                        <Button block size="large" onClick={() => navigate('/login')} className="h-12 font-semibold border-emerald-400 text-emerald-600">
                            Login Now
                        </Button>

                        <p className="text-center text-sm text-gray-400">
                            <Link to="/" className="text-emerald-600 hover:underline">← Back to Home</Link>
                        </p>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default RegisterPage;
