import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { Calendar, DollarSign, Phone, Zap, ArrowDown, ArrowUp, Filter } from 'lucide-react';
import { OperatorList, Recharge_Transaction } from '@/lib/apis';

const RechargeDashboard = () => {
  const [operators, setOperators] = useState([]);
  const [rechargeTransaction, setRechargeTransaction] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState('All'); // Changed default to 'All'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const operatorResponse = await OperatorList();
      setOperators(operatorResponse.data.data);

      const transactionResponse = await Recharge_Transaction();
      const formattedData = transactionResponse.data.data.map(item => ({
        ...item,
        created_at: new Date(item.created_at),
        operator_name: operatorResponse.data.data.find(op => String(op.operator_id) === String(item.operator))?.operator_name || item.operator
      }));
      
      setRechargeTransaction(formattedData);
      applyFilter(formattedData, filter, startDate, endDate);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (data, filterType, start, end) => {
    let filtered = [...data];
    const now = new Date();

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const dateAdded = new Date(item.created_at);
        return dateAdded >= startDate && dateAdded <= endDate;
      });
    } else if (filterType !== 'All') {
      switch (filterType) {
        case 'Daily':
          filtered = filtered.filter(item => {
            const dateAdded = new Date(item.created_at);
            return (
              dateAdded.getDate() === now.getDate() &&
              dateAdded.getMonth() === now.getMonth() &&
              dateAdded.getFullYear() === now.getFullYear()
            );
          });
          break;
        case 'Weekly':
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          filtered = filtered.filter(item => {
            const dateAdded = new Date(item.created_at);
            return dateAdded >= weekAgo;
          });
          break;
        case 'Monthly':
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(item => {
            const dateAdded = new Date(item.created_at);
            return dateAdded >= monthAgo;
          });
          break;
        default:
          break;
      }
    }

    setFilteredData(filtered);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setStartDate('');
    setEndDate('');
    applyFilter(rechargeTransaction, newFilter, '', '');
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      applyFilter(rechargeTransaction, '', startDate, endDate);
    }
  };

  // Calculate metrics
  const today = new Date().toISOString().split('T')[0];
  const totalRecharge = filteredData.length > 0 ? filteredData.reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0) : 0;

  const yesterdayTotalRecharge = rechargeTransaction
    .filter((transaction) => transaction.created_at < new Date(today))
    .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);

  const comparisonRate = yesterdayTotalRecharge
    ? ((totalRecharge - yesterdayTotalRecharge) / yesterdayTotalRecharge) * 100
    : 0;

  const rechargeTransactionTillYesterday = rechargeTransaction.filter((transaction) => transaction.created_at < new Date(today));
  const totalAvgTicket = filteredData.length > 0 ? totalRecharge / filteredData.length : 0;
  const totalAvgTicketTillYesterday = rechargeTransactionTillYesterday.length > 0 ? yesterdayTotalRecharge / rechargeTransactionTillYesterday.length : 0;

  const comparisonRateAvg = totalAvgTicketTillYesterday
    ? ((totalAvgTicket - totalAvgTicketTillYesterday) / totalAvgTicketTillYesterday) * 100
    : 0;

  const totalSuccessfulTransaction = filteredData.length > 0 ? filteredData.filter((transaction) => transaction.status === 'success').length : 0;
  const totalSuccessfulTransactionTillYesterday = rechargeTransactionTillYesterday.length > 0 ? rechargeTransactionTillYesterday.filter((transaction) => transaction.status === 'success').length : 0;

  const successRateTillToday = filteredData.length > 0 ? (totalSuccessfulTransaction / filteredData.length) * 100 : 0;
  const successRateTillYesterday = rechargeTransactionTillYesterday.length > 0 ? (totalSuccessfulTransactionTillYesterday / rechargeTransactionTillYesterday.length) * 100 : 0;

  const comparisonRateSuccess = (successRateTillToday - successRateTillYesterday).toFixed(2);

  const processTransactionData = () => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }

    const dates = [...new Set(filteredData.map(tx => {
      const date = new Date(tx.created_at);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }))].sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));

    const chartData = dates.map(date => {
      const dateTransactions = filteredData.filter(tx => 
        new Date(tx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) === date
      );

      const totalAmount = dateTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0) || 0;
      const successCount = dateTransactions.filter(tx => tx.status === 'success').length || 0;
      const totalCount = dateTransactions.length || 0;
      const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;
      const avgTicket = totalCount > 0 ? totalAmount / totalCount : 0;

      return {
        date,
        totalAmount,
        successRate,
        avgTicket,
      };
    });

    return chartData;
  };

  const chartData = processTransactionData();

  // Top Operators data for export
  const topOperatorsData = operators.map(operator => {
    const totalAmount = filteredData
      .filter((transaction) => String(transaction.operator) === String(operator.operator_id))
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0) || 0;
    return {
      operator_name: operator.operator_name,
      total_amount: totalAmount,
    };
  });

  // Export data as CSV
  const exportData = () => {
    const summaryDataRows = [
      ['Total Recharges', totalRecharge.toFixed(2), yesterdayTotalRecharge.toFixed(2), comparisonRate.toFixed(2)],
      ['Total Revenue', totalRecharge.toFixed(2), yesterdayTotalRecharge.toFixed(2), comparisonRate.toFixed(2)],
      ['Avg Ticket Size', totalAvgTicket.toFixed(2), totalAvgTicketTillYesterday.toFixed(2), comparisonRateAvg.toFixed(2)],
      ['Success Rate', successRateTillToday.toFixed(2), successRateTillYesterday.toFixed(2), comparisonRateSuccess],
    ];

    const summaryHeader = ['Metric', 'Value (₹)', 'Yesterday Value (₹)', 'Comparison (%)'];

    const topOperatorsRows = topOperatorsData.map(operator => [
      operator.operator_name,
      operator.total_amount.toFixed(2),
    ]);

    const topOperatorsHeader = ['Operator Name', 'Total Amount (₹)'];

    const csv = [
      ['Summary Metrics'],
      ...summaryDataRows,
      summaryHeader,
      [''],
      ['Top Operators'],
      ...topOperatorsRows,
      topOperatorsHeader,
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recharge_dashboard_summary.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-800">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600">
              {`${entry.name}: ${entry.dataKey === 'successRate' ? `${entry.value.toFixed(2)}%` : `₹${entry.value.toLocaleString()}`}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Recharge Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <select
            className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            aria-label="Select filter period"
          >
            <option value="All">All</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <input
            type="date"
            className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-label="Start date"
          />
          <input
            type="date"
            className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            aria-label="End date"
          />
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
            onClick={handleDateFilter}
            disabled={!startDate || !endDate}
            aria-label="Apply date filter"
          >
            <Filter className="h-4 w-4 inline mr-1" /> Apply
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
            onClick={exportData}
            aria-label="Export data as CSV"
          >
            Export Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-md">
                  <Phone className="h-6 w-6" />
                </div>
                <span
                  className={`text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center ${
                    comparisonRate < 0 ? 'text-white bg-red-500' : 'text-white bg-green-500'
                  }`}
                >
                  {comparisonRate < 0 ? (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  )}
                  {comparisonRate.toFixed(2)}%
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-500">Total Recharges</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">₹{totalRecharge.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">
                vs. yesterday (₹{yesterdayTotalRecharge.toLocaleString()})
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-md">
                  <DollarSign className="h-6 w-6" />
                </div>
                <span
                  className={`text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center ${
                    comparisonRate < 0 ? 'text-white bg-red-500' : 'text-white bg-green-500'
                  }`}
                >
                  {comparisonRate < 0 ? (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  )}
                  {comparisonRate.toFixed(2)}%
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">₹{totalRecharge.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">
                vs. yesterday (₹{yesterdayTotalRecharge.toLocaleString()})
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-md">
                  <BarChart className="h-6 w-6" />
                </div>
                <span
                  className={`text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center ${
                    comparisonRateAvg < 0 ? 'text-white bg-red-500' : 'text-white bg-green-500'
                  }`}
                >
                  {comparisonRateAvg < 0 ? (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  )}
                  {comparisonRateAvg.toFixed(2)}%
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-500">Avg Ticket Size</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">₹{totalAvgTicket.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">
                vs. yesterday (₹{totalAvgTicketTillYesterday.toFixed(2)})
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 text-yellow-600 rounded-md">
                  <Zap className="h-6 w-6" />
                </div>
                <span
                  className={`text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center ${
                    comparisonRateSuccess < 0 ? 'text-white bg-red-500' : 'text-white bg-green-500'
                  }`}
                >
                  {comparisonRateSuccess < 0 ? (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  )}
                  {comparisonRateSuccess}%
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-500">Success Rate</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">{successRateTillToday.toFixed(2)}%</p>
              <p className="text-sm text-gray-500 mt-2">
                vs. yesterday ({successRateTillYesterday.toFixed(2)}%)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recharge Amount Trend</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="totalAmount"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#6366f1', stroke: '#ff', strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                        animationDuration={800}
                        name="Total Recharge Amount"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Success Rate by Day</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        dataKey="successRate"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                        barSize={30}
                        animationDuration={800}
                        name="Success Rate (%)"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fillOpacity={0.8 + index * 0.02} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Average Ticket Size</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="avgTicket"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                        animationDuration={800}
                        name="Average Ticket Size"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-800">Top Operators</h3>
                atri
                <select
                  className="border border-gray-200 rounded-lg bg-white text-sm p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Sort top operators"
                >
                  <option value="volume">By Volume</option>
                  <option value="revenue" selected>By Revenue</option>
                </select>
              </div>
              <div className="space-y-4">
                {operators && operators.length > 0 ? (
                  operators.map((operator) => {
                    const totalAmount = filteredData
                      .filter((transaction) => String(transaction.operator) === String(operator.operator_id))
                      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0) || 0;

                    return (
                      <div key={operator.id || operator.operator_id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                            <span className="font-medium">
                              {operator.operator_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{operator.operator_name}</p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-800">₹{totalAmount.toLocaleString()}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No operators available.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-800">Recent Transactions</h3>
              <button
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="View all transactions"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operator
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    [...filteredData]
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .map((transaction) => (
                        <tr key={transaction.referenceid} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.referenceid}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.canumber}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.operator_name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{parseFloat(transaction.amount).toFixed(2)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaction.status === 'success'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">
                        No transactions found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RechargeDashboard;