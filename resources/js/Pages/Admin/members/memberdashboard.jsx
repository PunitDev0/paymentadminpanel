import React, { useState, useEffect, useCallback } from 'react';
import { Search, RotateCcw, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { getOnBoardRequests, updateOnBoardRequestStatus } from '@/lib/apis';
import _ from 'lodash';

const MemberDetails = () => {
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [company, setCompany] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState(null);
    const [filterError, setFilterError] = useState(null);

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getOnBoardRequests();
                // Transform status from true/false to 1/0 if needed
                const transformedData = (data.onboard_requests || []).map(item => ({
                    ...item,
                    status: item.status === true ? 1 : item.status === false ? 0 : item.status
                }));
                setAllData(transformedData);
                filterData(transformedData, searchValue, fromDate, toDate, company, status);
            } catch (error) {
                setError('Failed to fetch data: ' + error.message);
            }
        };
        fetchData();
    }, []);

    // Debounced filter function
    const debouncedFilter = useCallback(
        _.debounce((data, search, from, to, companyFilter, statusFilter) => {
            filterData(data, search, from, to, companyFilter, statusFilter);
        }, 300),
        []
    );

    // Filter data based on all criteria
    const filterData = (data, search, from, to, companyFilter, statusFilter) => {
        let filtered = [...data];
        setFilterError(null);

        // Search filter
        if (search) {
            filtered = filtered.filter(item =>
                item.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                item.email?.toLowerCase().includes(search.toLowerCase()) ||
                item.mobile?.toLowerCase().includes(search.toLowerCase()) ||
                item.merchantcode?.toLowerCase().includes(search.toLowerCase()) ||
                item.firm?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Date range filter
        if (from && to) {
            const fromDateObj = new Date(from);
            const toDateObj = new Date(to);
            toDateObj.setHours(23, 59, 59, 999);

            if (toDateObj < fromDateObj) {
                setFilterError('To date must be after from date');
                setFilteredData([]);
                return;
            }

            filtered = filtered.filter(item => {
                const itemDate = new Date(item.created_at);
                return itemDate >= fromDateObj && itemDate <= toDateObj;
            });
        }

        // Firm filter
        if (companyFilter) {
            filtered = filtered.filter(item => item.firm === companyFilter);
        }

        // Status filter
        if (statusFilter !== '') {
            const statusValue = parseInt(statusFilter);
            filtered = filtered.filter(item => item.status === statusValue);
        }

        setFilteredData(filtered);
    };

    // Handle search input change (dynamic filtering)
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        debouncedFilter(allData, value, fromDate, toDate, company, status);
    };

    // Handle manual search button click
    const handleSearch = () => {
        filterData(allData, searchValue, fromDate, toDate, company, status);
    };

    // Handle reset button
    const handleReset = () => {
        setSearchValue('');
        setFromDate('');
        setToDate('');
        setCompany('');
        setStatus('');
        setFilterError(null);
        filterData(allData, '', '', '', '', '');
    };

    // Handle date changes
    const handleDateChange = (type, value) => {
        if (type === 'from') setFromDate(value);
        if (type === 'to') setToDate(value);
        debouncedFilter(allData, searchValue, type === 'from' ? value : fromDate, type === 'to' ? value : toDate, company, status);
    };

    // Handle firm/status changes
    const handleFilterChange = (type, value) => {
        if (type === 'company') setCompany(value);
        if (type === 'status') setStatus(value);
        debouncedFilter(allData, searchValue, fromDate, toDate, type === 'company' ? value : company, type === 'status' ? value : status);
    };

    // Get unique firms for filter
    const uniqueFirms = [...new Set(allData.map(item => item.firm).filter(firm => firm))];

    // CSV export
    const escapeCSV = (value) => `"${String(value || 'N/A').replace(/"/g, '""')}"`;

    const handleExport = () => {
        const csv = [
            ['#', 'Full Name', 'Merchant Code', 'Mobile', 'Status', 'Email', 'Firm', 'Aadhaar Front', 'Aadhaar Back', 'PAN Card', 'Created At'],
            ...filteredData.map((item, index) => [
                index + 1,
                escapeCSV(item.full_name),
                escapeCSV(item.merchantcode),
                escapeCSV(item.mobile),
                escapeCSV(item.status === 1 ? 'Active' : 'Inactive'),
                escapeCSV(item.email),
                escapeCSV(item.firm),
                escapeCSV(item.aadhaarFront),
                escapeCSV(item.aadhaarBack),
                escapeCSV(item.panCard),
                escapeCSV(new Date(item.created_at).toLocaleDateString()),
            ]),
        ]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'onboard_requests.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Handle status toggle
    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        try {
            await updateOnBoardRequestStatus(id, newStatus);
            setAllData(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, status: newStatus } : item
                )
            );
            filterData(
                allData.map(item =>
                    item.id === id ? { ...item, status: newStatus } : item
                ),
                searchValue,
                fromDate,
                toDate,
                company,
                status
            );
            alert('Status updated successfully.');
        } catch (error) {
            setError('Failed to update status: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Onboard Requests</h1>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => handleDateChange('from', e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="From date"
                                />
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => handleDateChange('to', e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="To date"
                                />
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    placeholder="Search by name, email, mobile, merchant code, or firm"
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                                    aria-label="Search requests"
                                />
                                <select
                                    value={status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Select status"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                                <select
                                    value={company}
                                    onChange={(e) => handleFilterChange('company', e.target.value)}
                                    className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Select firm"
                                >
                                    <option value="">All Firms</option>
                                    {uniqueFirms.map(firm => (
                                        <option key={firm} value={firm}>{firm}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSearch}
                                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                    aria-label="Search requests"
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
                        {filterError && (
                            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
                                {filterError}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md mt-6 p-4 sm:p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Onboard Requests List</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Full Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Merchant Code
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Mobile
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Firm
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Aadhaar Front
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Aadhaar Back
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        PAN Card
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Created At
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.full_name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.merchantcode || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.mobile || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <button
                                                    onClick={() => handleStatusToggle(item.id, item.status)}
                                                    className="flex items-center focus:outline-none"
                                                    aria-label={`Toggle status for ${item.full_name}`}
                                                >
                                                    {item.status === 1 ? (
                                                        <ToggleRight className="h-6 w-6 text-green-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-6 w-6 text-gray-400" />
                                                    )}
                                                    <span className="ml-2">{item.status === 1 ? 'Active' : 'Inactive'}</span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.firm || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.aadhaarFront ? (
                                                    <a href={item.aadhaarFront} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                                        View
                                                    </a>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.aadhaarBack ? (
                                                    <a href={item.aadhaarBack} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                                        View
                                                    </a>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.panCard ? (
                                                    <a href={item.panCard} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                                        View
                                                    </a>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="px-6 py-4 text-center text-sm text-gray-500">
                                            {filterError ? 'Invalid filter criteria' : 'No Data Available in Table'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                        <p className="text-sm text-gray-500">
                            Showing {filteredData.length} of {allData.length} entries
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

                {error && (
                    <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        <p><strong>Error:</strong> {error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberDetails;