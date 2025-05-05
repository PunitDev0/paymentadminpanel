import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, FileText, UserPlus, X, Save, Menu } from 'lucide-react';
import { getRoles, getAllMembers, addMember, deleteMember } from '@/lib/apis';

const MemberDetails = () => {
    const [roles, setRoles] = useState([]);
    const [activeTab, setActiveTab] = useState('');
    const [allData, setAllData] = useState({});
    const [filteredData, setFilteredData] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [company, setCompany] = useState('');
    const [status, setStatus] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState(null);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        role: '',
        name: '',
        email: '',
        company: '',
        pancard_number: '',
        aadhaar_number: '',
        mobile: '',
        address: '',
        state: '',
        city: '',
        pincode: '',
        otp_verifaction: 0,
    });

    useEffect(() => {
        const fetchRolesAndData = async () => {
            try {
                const fetchedRoles = await getRoles();
                const roleNames = fetchedRoles.map(role => role.name);
                console.log('Fetched roles:', roleNames);
                setRoles(roleNames);

                if (roleNames.length > 0) {
                    setActiveTab(roleNames[0]);
                    setFormData(prev => ({ ...prev, role: roleNames[0] }));
                }

                const data = await getAllMembers();
                setAllData(data);

                if (roleNames.length > 0) {
                    const dataKey = `${roleNames[0]}s`;
                    filterData(roleNames[0], data[dataKey] || [], searchValue, fromDate, toDate, company, status);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data: ' + error.message);
            }
        };
        fetchRolesAndData();
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const dataKey = `${tab}s`;
        filterData(tab, allData[dataKey] || [], searchValue, fromDate, toDate, company, status);
    };

    const filterData = (tab, data, search, from, to, companyFilter, statusFilter) => {
        let filtered = [...(data || [])];

        if (search) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (from && to) {
            const fromDate = new Date(from);
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.created_at);
                return itemDate >= fromDate && itemDate <= toDate;
            });
        }

        if (companyFilter) {
            filtered = filtered.filter(item => item.company === companyFilter);
        }

        if (statusFilter) {
            filtered = filtered.filter(item => item.status === statusFilter);
        }

        setFilteredData(filtered);
    };

    const handleSearch = () => {
        const dataKey = `${activeTab}s`;
        filterData(activeTab, allData[dataKey] || [], searchValue, fromDate, toDate, company, status);
    };

    const handleReset = () => {
        setSearchValue('');
        setFromDate('');
        setToDate('');
        setCompany('');
        setStatus('');
        const dataKey = `${activeTab}s`;
        filterData(activeTab, allData[dataKey] || [], '', '', '', '', '');
    };

    const escapeCSV = (value) => `"${String(value).replace(/"/g, '""')}"`;

    const handleExport = () => {
        const csv = [
            ['#', 'Name', 'Email', 'Mobile', 'Company', 'Pancard', 'Aadhaar', 'Created At'],
            ...filteredData.map((item, index) => [
                index + 1,
                escapeCSV(item.name || 'N/A'),
                escapeCSV(item.email || 'N/A'),
                escapeCSV(item.mobile || 'N/A'),
                escapeCSV(item.company || 'N/A'),
                escapeCSV(item.pancard_number || 'N/A'),
                escapeCSV(item.aadhaar_number || 'N/A'),
                escapeCSV(new Date(item.created_at).toLocaleDateString()),
            ]),
        ]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `member_details_${activeTab.toLowerCase()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleDelete = async (memberId) => {
        if (window.confirm('Are you sure you want to deactivate this member?')) {
            try {
                await deleteMember(memberId);
                const updatedData = await getAllMembers();
                setAllData(updatedData);
                const dataKey = `${activeTab}s`;
                filterData(activeTab, updatedData[dataKey] || [], searchValue, fromDate, toDate, company, status);
                alert('Member deactivated successfully.');
            } catch (error) {
                setError('Failed to deactivate member: ' + error.message);
            }
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name) errors.name = 'Name is required';
        if (!formData.email) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
        if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) errors.mobile = 'Mobile must be 10 digits';
        if (formData.pancard_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pancard_number))
            errors.pancard_number = 'Invalid PAN format';
        if (formData.aadhaar_number && !/^\d{12}$/.test(formData.aadhaar_number))
            errors.aadhaar_number = 'Aadhaar must be 12 digits';
        if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) errors.pincode = 'Pincode must be 6 digits';
        return errors;
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setGeneratedPassword(null);

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        console.log('Form Data being sent:', formData);

        try {
            const response = await addMember(formData);
            const updatedData = await getAllMembers();
            setAllData(updatedData);
            const dataKey = `${activeTab}s`;
            filterData(activeTab, updatedData[dataKey] || [], searchValue, fromDate, toDate, company, status);

            if (response.generated_password) {
                setGeneratedPassword(response.generated_password);
            }

            setFormData({
                role: roles[0] || '',
                name: '',
                email: '',
                company: '',
                pancard_number: '',
                aadhaar_number: '',
                mobile: '',
                address: '',
                state: '',
                city: '',
                pincode: '',
                otp_verifaction: 0,
            });
            setShowForm(false);
            alert('User added successfully.');
        } catch (error) {
            setError('Failed to add user: ' + (error.response?.data?.error || error.message));
        }
    };

    if (showForm) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto p-4 sm:p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Create User</h1>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Member Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleFormChange}
                                    className={`mt-1 block w-full border ${formErrors.role ? 'border-red-500' : 'border-gray-200'} rounded-lg p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    aria-label="Select role"
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.role && <p className="text-xs text-red-500 mt-1">{formErrors.role}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    className={`mt-1 block w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-200'} rounded-lg p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    placeholder="Enter name"
                                    required
                                    aria-label="Member name"
                                />
                                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    className={`mt-1 block w-full border ${formErrors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    placeholder="Enter email"
                                    required
                                    aria-label="Member email"
                                />
                                {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company</label>
                                <select
                                    name="company"
                                    value={formData.company}
                                    onChange={handleFormChange}
                                    className="mt-1 block w-full border border-gray-200 rounded-lg p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Select company"
                                >
                                    <option value="">Select Company</option>
                                    <option value="Banking NIKAT-By">Banking NIKAT-By</option>
                                </select>
                            </div>
                        </div>

                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Business Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pancard Number</label>
                                <input
                                    type="text"
                                    name="pancard_number"
                                    value={formData.pancard_number}
                                    onChange={handleFormChange}
                                    className={`mt-1 block w-full border ${formErrors.pancard_number ? 'border-red-500' : 'border-gray-200'} rounded-lg p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    placeholder="Enter PAN number"
                                    aria-label="Pancard number"
                                />
                                {formErrors.pancard_number && <p className="text-xs text-red-500 mt-1">{formErrors.pancard_number}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Aadhaarcard Number</label>
                                <input
                                    type="text"
                                    name="aadhaar_number"
                                    value={formData.aadhaar_number}
                                    onChange={handleFormChange}
                                    className={`mt-1 block w-full border ${formErrors.aadhaar_number ? 'border-red-500' : 'border-gray-200'} rounded-lg p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    placeholder="Enter Aadhaar number"
                                    aria-label="Aadhaarcard number"
                                />
                                {formErrors.aadhaar_number && <p className="text-xs text-red-500 mt-1">{formErrors.aadhaar_number}</p>}
                            </div>
                        </div>

                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Personal Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mobile</label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleFormChange}
                                    className={`mt-1 block w-full border ${formErrors.mobile ? 'border-red-500' : 'border-gray-200'} rounded-lg p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    placeholder="Enter mobile number"
                                    aria-label="Mobile number"
                                />
                                {formErrors.mobile && <p className="text-xs text-red-500 mt-1">{formErrors.mobile}</p>}
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleFormChange}
                                    className="mt-1 block w-full border border-gray-200 rounded-lg p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter address"
                                    aria-label="Address"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleFormChange}
                                    className="mt-1 block w-full border border-gray-200 rounded-lg p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter state"
                                    aria-label="State"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleFormChange}
                                    className="mt-1 block w-full border border-gray-200 rounded-lg p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter city"
                                    aria-label="City"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleFormChange}
                                    className={`mt-1 block w-full border ${formErrors.pincode ? 'border-red-500' : 'border-gray-200'} rounded-lg p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    placeholder="Enter pincode"
                                    aria-label="Pincode"
                                />
                                {formErrors.pincode && <p className="text-xs text-red-500 mt-1">{formErrors.pincode}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                                aria-label="Cancel form"
                            >
                                <X className="h-4 w-4 inline mr-1" /> Cancel
                            </button>
                            <button
                                onClick={handleFormSubmit}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                aria-label="Submit form"
                            >
                                <Save className="h-4 w-4 inline mr-1" /> Submit
                            </button>
                        </div>

                        {generatedPassword && (
                            <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
                                <p><strong>Generated Password:</strong> {generatedPassword}</p>
                                <p>Please save this password securely. It will be needed for login.</p>
                                <p>An email with the credentials has been sent to the user.</p>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                                <p><strong>Error:</strong> {error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Member Details</h1>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        {roles.map(role => (
                            <button
                                key={role}
                                onClick={() => handleTabChange(role)}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === role ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'} transition-colors duration-200`}
                                aria-label={`View ${role} members`}
                            >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="From date"
                                />
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="To date"
                                />
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    placeholder="Search by name or email"
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Search members"
                                />
                                <input
                                    type="text"
                                    placeholder="Agent ID / Parent ID"
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Agent ID or Parent ID"
                                />
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Select status"
                                >
                                    <option value="">Select Status</option>
                                    <option value="active">Active</option>
                                    <option value="deactive">Deactive</option>
                                </select>
                                <select
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Select company"
                                >
                                    <option value="">Select Company</option>
                                    <option value="Banking NIKAT-By">Banking NIKAT-By</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSearch}
                                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                    aria-label="Search members"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                                    aria-label="Reset filters"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                                    aria-label="Export data as CSV"
                                >
                                    <FileText className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md mt-6 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List
                        </h2>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                            aria-label="Add new user"
                        >
                            <UserPlus className="h-4 w-4 inline mr-1" /> Add User
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Mobile
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Company
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Pancard
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Aadhaar
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.mobile || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.company || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.pancard_number || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.aadhaar_number || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="relative inline-block text-left">
                                                    <button
                                                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        aria-label={`Actions for ${item.name}`}
                                                    >
                                                        <Menu className="h-4 w-4 text-gray-600" />
                                                    </button>
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 hidden group-hover:block">
                                                        <div className="py-1">
                                                            <button
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                onClick={() => alert('View Reports for ' + item.name)}
                                                            >
                                                                Reports
                                                            </button>
                                                            {activeTab !== 'deactivated' && (
                                                                <button
                                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                                    onClick={() => handleDelete(item.id)}
                                                                >
                                                                    Deactivate
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No Data Available in Table
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                        <p className="text-sm text-gray-500">
                            Showing {filteredData.length} of {filteredData.length} entries
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100" disabled>
                                Previous
                            </button>
                            <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg">1</span>
                            <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100" disabled>
                                Next
                            </button>
                            <select className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Select page size">
                                <option>Show 10</option>
                                <option>Show 25</option>
                                <option>Show 50</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDetails;