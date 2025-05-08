import React, { useState, useEffect } from 'react';
import { getCommissions, updateCommissions } from '@/lib/apis';

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

const SchemeManager = () => {
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
    const [changedData, setChangedData] = useState({});
    const [selectedSection, setSelectedSection] = useState('recharge');
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
        const fetchCommissions = async () => {
            try {
                const data = await getCommissions();
                setCommissions(data);
            } catch (error) {
                console.error('Failed to fetch commissions:', error);
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
            }
        };
        fetchCommissions();
    }, []);

    const handleCommissionChange = (commissionId, value, commissionType) => {
        const numericValue = value === '' ? 0 : parseFloat(value) || 0;

        setCommissions((prev) => {
            const updatedCommissions = { ...prev };
            const commissionIndex = updatedCommissions[commissionType].findIndex(
                (item) => item.id === commissionId
            );

            if (commissionIndex !== -1) {
                updatedCommissions[commissionType][commissionIndex] = {
                    ...updatedCommissions[commissionType][commissionIndex],
                    our_commission: numericValue,
                };

                setChangedData((prevChanged) => {
                    const updatedChanged = { ...prevChanged };
                    if (!updatedChanged[commissionType]) {
                        updatedChanged[commissionType] = [];
                    }

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

            return updatedCommissions;
        });
    };

    const handleSaveAll = async () => {
        if (Object.keys(changedData).length === 0) {
            alert('No changes to save.');
            return;
        }

        try {
            await updateCommissions(changedData);
            alert('Commissions updated successfully!');
            setChangedData({});
        } catch (error) {
            alert('Failed to update commissions: ' + error.message);
        }
    };

    const handleSaveRow = async (commissionId, commissionType) => {
        const commissionData = changedData[commissionType]?.find(
            (item) => item.id === commissionId
        );

        if (!commissionData) {
            alert('No changes to save for this row.');
            return;
        }

        try {
            await updateCommissions({ [commissionType]: [commissionData] });
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
            alert('Commission updated successfully!');
        } catch (error) {
            alert('Failed to update commission: ' + error.message);
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
            : [services.find(s => s.id === selectedSection)?.id + '_commissions'];

        return (
            <div className="mt-6 space-y-8">
                {commissionTypes.map((commissionType) => {
                    const commissionData = commissions[commissionType] || [];
                    const filteredData = getFilteredData(commissionData, commissionType);
                    if (!filteredData.length) return null;

                    const service = services.find(s => (s.id + '_commissions') === commissionType);
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
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Our Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </>
                                            )}
                                            {['gas_fastag_commissions', 'broadband_commissions'].includes(commissionType) && (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Our Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </>
                                            )}
                                            {commissionType === 'cms_commissions' && (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Our Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </>
                                            )}
                                            {commissionType === 'bank_commissions' && (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Amount</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Our Commission</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredData.map((item) => (
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
                                                                value={item.our_commission}
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
                                                                value={item.our_commission}
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
                                                                value={item.our_commission}
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
                                                                value={item.our_commission}
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
                                        ))}
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
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
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
                {renderCommissionDetails()}
            </div>
        </div>
    );
};

export default SchemeManager;