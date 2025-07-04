import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

const services = [
    { id: 'all', title: 'All Commissions' },
    { id: 'recharge', title: 'Recharge' },
    { id: 'electricity', title: 'Electricity' },
    { id: 'digital_voucher', title: 'Digital Voucher' },
    { id: 'datacard', title: 'Datacard' },
    { id: 'gas_fastag', title: 'Gas & Fastag' },
    { id: 'cms', title: 'CMS' },
    { id: 'challan', title: 'Challan' },
    { id: 'cable', title: 'Cable' },
    { id: 'broadband', title: 'Broadband' },
    { id: 'bank', title: 'Bank' },
];

export const getCommissions = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/data`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch default commissions');
    }
};

export const getUserCommissions = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/users/${userId}/data`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch user commissions');
    }
};

export const getUsers = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch users');
    }
};

export const updateCommissions = async (type, data) => {
    try {
        const response = await axios.put(`${BASE_URL}/${type}`, data, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to update default commissions for ${type}`);
    }
};

export const updateUserCommissions = async (userId, data) => {
    try {
        const response = await axios.put(`${BASE_URL}/users/${userId}`, data, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to update user commissions');
    }
};

const Commission = () => {
    const [commissions, setCommissions] = useState({
        recharge_commissions: [],
        electricity_commissions: [],
        digital_voucher_commissions: [],
        datacard_commissions: [],
        gas_fastag_commissions: [],
        cms_commissions: [],
        challan_commissions: [],
        cable_commissions: [],
        broadband_commissions: [],
        bank_commissions: [],
    });
    const [userCommissions, setUserCommissions] = useState({});
    const [changedData, setChangedData] = useState({});
    const [selectedSection, setSelectedSection] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchQueries, setSearchQueries] = useState({
        recharge_commissions: '',
        electricity_commissions: '',
        digital_voucher_commissions: '',
        datacard_commissions: '',
        gas_fastag_commissions: '',
        cms_commissions: '',
        challan_commissions: '',
        cable_commissions: '',
        broadband_commissions: '',
        bank_commissions: '',
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const defaultData = await getCommissions();
                setCommissions(defaultData);
                const usersData = await getUsers();
                setUsers(usersData);
            } catch (error) {
                console.error('Failed to fetch initial data:', error);
                setCommissions({
                    recharge_commissions: [],
                    electricity_commissions: [],
                    digital_voucher_commissions: [],
                    datacard_commissions: [],
                    gas_fastag_commissions: [],
                    cms_commissions: [],
                    challan_commissions: [],
                    cable_commissions: [],
                    broadband_commissions: [],
                    bank_commissions: [],
                });
                setUsers([]);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchUserCommissions = async () => {
            if (selectedUser) {
                try {
                    const data = await getUserCommissions(selectedUser.id);
                    setCommissions(data.default_commissions);
                    const userCommissionMap = {};
                    data.user_commissions.forEach((uc) => {
                        userCommissionMap[`${uc.commission_type}_${uc.commission_id}`] = uc.user_commission;
                    });
                    setUserCommissions(userCommissionMap);
                } catch (error) {
                    console.error('Failed to fetch user commissions:', error);
                    setUserCommissions({});
                }
            } else {
                setUserCommissions({});
                getCommissions().then(setCommissions).catch(console.error);
            }
        };
        fetchUserCommissions();
    }, [selectedUser]);

    const handleCommissionChange = (commissionId, value, commissionType) => {
        const numericValue = value === '' ? 0 : parseFloat(value) || 0;
        const typeKey = commissionType.replace('_commissions', '');

        if (selectedUser) {
            setUserCommissions((prev) => ({
                ...prev,
                [`${typeKey}_${commissionId}`]: numericValue,
            }));

            setChangedData((prev) => {
                const updatedChanged = { ...prev };
                if (!updatedChanged.userCommissions) updatedChanged.userCommissions = [];
                const existingIndex = updatedChanged.userCommissions.findIndex(
                    (item) => item.commission_type === typeKey && item.commission_id === commissionId
                );

                if (existingIndex !== -1) {
                    updatedChanged.userCommissions[existingIndex] = {
                        commission_type: typeKey,
                        commission_id: commissionId,
                        user_commission: numericValue,
                    };
                } else {
                    updatedChanged.userCommissions.push({
                        commission_type: typeKey,
                        commission_id: commissionId,
                        user_commission: numericValue,
                    });
                }
                return updatedChanged;
            });
        } else {
            setChangedData((prev) => {
                const updatedChanged = { ...prev };
                if (!updatedChanged[commissionType]) updatedChanged[commissionType] = [];
                const existingIndex = updatedChanged[commissionType].findIndex(
                    (item) => item.id === commissionId
                );

                if (existingIndex !== -1) {
                    updatedChanged[commissionType][existingIndex] = {
                        id: commissionId,
                        our_commission: numericValue,
                    };
                } else {
                    updatedChanged[commissionType].push({
                        id: commissionId,
                        our_commission: numericValue,
                    });
                }
                return updatedChanged;
            });
        }
    };

    const handleSaveAll = async () => {
        if (Object.keys(changedData).length === 0) {
            alert('No changes to save.');
            return;
        }

        try {
            if (selectedUser && changedData.userCommissions) {
                await updateUserCommissions(selectedUser.id, changedData.userCommissions);
                alert('User commissions updated successfully!');
            } else {
                const promises = Object.keys(changedData).map((commissionType) =>
                    updateCommissions(commissionType.replace('_commissions', ''), changedData[commissionType])
                );
                await Promise.all(promises);
                alert('Default commissions updated successfully!');
            }
            setChangedData({});
        } catch (error) {
            alert('Failed to update commissions: ' + error.message);
        }
    };

    const handleSaveRow = async (commissionId, commissionType) => {
        const typeKey = commissionType.replace('_commissions', '');

        if (selectedUser) {
            const commissionData = changedData.userCommissions?.find(
                (item) => item.commission_type === typeKey && item.commission_id === commissionId
            );

            if (!commissionData) {
                alert('No changes to save for this row.');
                return;
            }

            try {
                await updateUserCommissions(selectedUser.id, [commissionData]);
                setChangedData((prev) => ({
                    ...prev,
                    userCommissions: prev.userCommissions?.filter(
                        (item) => !(item.commission_type === typeKey && item.commission_id === commissionId)
                    ) || [],
                }));
                alert('User commission updated successfully!');
            } catch (error) {
                alert('Failed to update user commission: ' + error.message);
            }
        } else {
            const commissionData = changedData[commissionType]?.find(
                (item) => item.id === commissionId
            );

            if (!commissionData) {
                alert('No changes to save for this row.');
                return;
            }

            try {
                await updateCommissions(typeKey, [commissionData]);
                setChangedData((prev) => {
                    const updatedChanged = { ...prev };
                    updatedChanged[commissionType] = updatedChanged[commissionType].filter(
                        (item) => item.id !== commissionId
                    );
                    if (updatedChanged[commissionType].length === 0) {
                        delete updatedChanged[commissionType];
                    }
                    return updatedChanged;
                });
                alert('Default commission updated successfully!');
            } catch (error) {
                alert('Failed to update default commission: ' + error.message);
            }
        }
    };

    const handleSearchChange = (commissionType, value) => {
        setSearchQueries((prev) => ({
            ...prev,
            [commissionType]: value,
        }));
    };

    const getFilteredData = (commissionData, commissionType) => {
        const query = searchQueries[commissionType].toLowerCase();
        if (!query) return commissionData;

        return commissionData.filter((item) => {
            if (commissionType === 'bank_commissions') {
                return (
                    item.transaction_amount?.toString().toLowerCase().includes(query) ||
                    item.category?.toLowerCase().includes(query)
                );
            } else if (commissionType === 'cms_commissions') {
                return (
                    item.operator_id?.toLowerCase().includes(query) ||
                    item.operator_name?.toLowerCase().includes(query) ||
                    item.type?.toLowerCase().includes(query)
                );
            } else if (['gas_fastag_commissions', 'broadband_commissions'].includes(commissionType)) {
                return (
                    item.operator_name?.toLowerCase().includes(query) ||
                    item.category?.toLowerCase().includes(query) ||
                    item.type?.toLowerCase().includes(query)
                );
            } else {
                return (
                    item.operator_name?.toLowerCase().includes(query) ||
                    item.type?.toLowerCase().includes(query)
                );
            }
        });
    };

    const renderCommissionDetails = () => {
        const commissionTypes = selectedSection === 'all'
            ? Object.keys(commissions)
            : [services.find((s) => s.id === selectedSection)?.id + '_commissions'];

        return (
            <div className="mt-6 space-y-8">
                {selectedUser && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">User Details</h3>
                        <p><strong>Name:</strong> {selectedUser.name}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                    </div>
                )}
                {commissionTypes.map((commissionType) => {
                    const commissionData = commissions[commissionType] || [];
                    const filteredData = getFilteredData(commissionData, commissionType);
                    if (!filteredData.length) return null;

                    const service = services.find((s) => s.id + '_commissions' === commissionType);
                    if (!service) return null;

                    return (
                        <div key={commissionType} className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">{service.title} Commissions</h3>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder={`Search ${service.title}...`}
                                    value={searchQueries[commissionType]}
                                    onChange={(e) => handleSearchChange(commissionType, e.target.value)}
                                    className="w-full sm:w-64 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            {['recharge_commissions', 'electricity_commissions', 'digital_voucher_commissions', 'datacard_commissions', 'challan_commissions', 'cable_commissions'].includes(commissionType) && (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{selectedUser ? 'User Commission' : 'Set Commission'}</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </>
                                            )}
                                            {['gas_fastag_commissions', 'broadband_commissions'].includes(commissionType) && (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{selectedUser ? 'User Commission' : 'Set Commission'}</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </>
                                            )}
                                            {commissionType === 'cms_commissions' && (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{selectedUser ? 'User Commission' : 'Set Commission'}</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </>
                                            )}
                                            {commissionType === 'bank_commissions' && (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Amount</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{selectedUser ? 'User Commission' : 'Set Commission'}</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredData.map((item) => {
                                            const typeKey = commissionType.replace('_commissions', '');
                                            const commissionValue = selectedUser
                                                ? userCommissions[`${typeKey}_${item.id}`] ?? item.commission
                                                : item.commission;
                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    {['recharge_commissions', 'electricity_commissions', 'digital_voucher_commissions', 'datacard_commissions', 'challan_commissions', 'cable_commissions'].includes(commissionType) && (
                                                        <>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.operator_name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.type}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.commission}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={commissionValue}
                                                                    onChange={(e) => handleCommissionChange(item.id, e.target.value, commissionType)}
                                                                    className="border rounded-lg p-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <button
                                                                    onClick={() => handleSaveRow(item.id, commissionType)}
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                                >
                                                                    Save
                                                                </button>
                                                            </td>
                                                        </>
                                                    )}
                                                    {['gas_fastag_commissions', 'broadband_commissions'].includes(commissionType) && (
                                                        <>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.operator_name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.type}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.commission}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={commissionValue}
                                                                    onChange={(e) => handleCommissionChange(item.id, e.target.value, commissionType)}
                                                                    className="border rounded-lg p-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <button
                                                                    onClick={() => handleSaveRow(item.id, commissionType)}
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                                >
                                                                    Save
                                                                </button>
                                                            </td>
                                                        </>
                                                    )}
                                                    {commissionType === 'cms_commissions' && (
                                                        <>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.operator_id}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.operator_name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.type}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.commission}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={commissionValue}
                                                                    onChange={(e) => handleCommissionChange(item.id, e.target.value, commissionType)}
                                                                    className="border rounded-lg p-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <button
                                                                    onClick={() => handleSaveRow(item.id, commissionType)}
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                                >
                                                                    Save
                                                                </button>
                                                            </td>
                                                        </>
                                                    )}
                                                    {commissionType === 'bank_commissions' && (
                                                        <>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.transaction_amount}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.commission}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={commissionValue}
                                                                    onChange={(e) => handleCommissionChange(item.id, e.target.value, commissionType)}
                                                                    className="border rounded-lg p-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <button
                                                                    onClick={() => handleSaveRow(item.id, commissionType)}
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                                >
                                                                    Save
                                                                </button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
                {commissionTypes.length > 0 && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveAll}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
                        >
                            Save All Changes
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Commission Manager</h1>
                <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Commission Type</label>
                        <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            className="w-full sm:w-64 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select User (Optional)</label>
                        <select
                            value={selectedUser ? selectedUser.id : ''}
                            onChange={(e) => {
                                const userId = e.target.value;
                                setSelectedUser(users.find((u) => u.id === parseInt(userId)) || null);
                            }}
                            className="w-full sm:w-64 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Default (All Users)</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {renderCommissionDetails()}
            </div>
        </div>
    );
};

export default Commission;