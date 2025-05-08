import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {

    // Define the base URL based on the environment
    const BASE_URL = import.meta.env.VITE_APP_SERVER === "PRODUCTION"
        ? "https://banking.nikatby.com/admin/public"
        : "http://127.0.0.1:8000";

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        user_type: '',
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post(`${BASE_URL}/login`, formData, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
            });
            alert(response.data.message);
            console.log('Logged in user:', response.data.user);
            // Redirect to dashboard or handle successful login
            window.location.href = `${BASE_URL}`;
        } catch (error) {
            setError(error.response?.data?.error || 'An unexpected error occurred');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Login to Your Account</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* <div>
                        <label htmlFor="user_type" className="block text-sm font-medium text-gray-700">
                            User Type
                        </label>
                        <select
                            id="user_type"
                            name="user_type"
                            value={formData.user_type}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        >
                            <option value="">Select User Type</option>
                            <option value="ADMIN">Admin</option>
                            <option value="API_PARTNER">API Partner</option>
                            <option value="REGISTERED_USER">Registered User</option>
                        </select>
                    </div> */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                    >
                        Login
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                        <p className="text-sm font-medium">
                            <strong>Error:</strong> {error}
                        </p>
                    </div>
                )}

                <p className="mt-6 text-center text-sm text-gray-600">
                    Forgot your password?{' '}
                    <a href="/password/reset" className="text-blue-600 hover:underline">
                        Reset it here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;