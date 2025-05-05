import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ArrowUp, ArrowDown, DollarSign, FileText, Percent, Filter } from 'lucide-react';
import { getBillpaymentdata } from '@/lib/apis';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BillPaymentDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState('Daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getBillpaymentdata();
      console.log('Fetched Bill Payment Data:', result);
      const formattedData = result.map(item => ({
        ...item,
        date_added: new Date(item.date_added),
      }));
      setData(formattedData);
      applyFilter(formattedData, filter, startDate, endDate);
    } catch (error) {
      console.error('Failed to fetch bill payment data:', error);
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
        const dateAdded = new Date(item.date_added);
        return dateAdded >= startDate && dateAdded <= endDate;
      });
      console.log('Date Range Filter Applied:', { startDate, endDate, filtered });
    } else {
      switch (filterType) {
        case 'Daily':
          filtered = filtered.filter(item => {
            const dateAdded = new Date(item.date_added);
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
          filtered = filtered.filter(item => new Date(item.date_added) >= weekAgo);
          break;
        case 'Monthly':
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(item => new Date(item.date_added) >= monthAgo);
          break;
        default:
          break;
      }
      console.log(`${filterType} Filter Applied:`, filtered);
    }

    // If no data matches the filter, fall back to showing all data
    if (filtered.length === 0) {
      filtered = [...data];
    }

    setFilteredData(filtered);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setStartDate('');
    setEndDate('');
    applyFilter(data, newFilter, '', '');
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      applyFilter(data, '', startDate, endDate);
    }
  };

  // Calculate metrics
  const totalTransactions = filteredData.length;
  const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const avgAmount = totalTransactions ? (totalAmount / totalTransactions).toFixed(2) : 0;
  const successRate =
    totalTransactions > 0
      ? (
          (filteredData.filter(item => item.transaction_status.toLowerCase() === 'success').length /
            totalTransactions) *
          100
        ).toFixed(2)
      : 0;
  const totalCommission = filteredData.reduce((sum, item) => sum + parseFloat(item.commission || 0), 0);
  const totalTds = filteredData.reduce((sum, item) => sum + parseFloat(item.tds || 0), 0);
  const totalRefunded = filteredData.reduce((sum, item) => sum + parseFloat(item.refunded || 0), 0);

  // Calculate comparison metrics for yesterday
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayData = data.filter(item => {
    const itemDate = new Date(item.date_added);
    return (
      itemDate.getDate() === yesterday.getDate() &&
      itemDate.getMonth() === yesterday.getMonth() &&
      itemDate.getFullYear() === yesterday.getFullYear()
    );
  });
  const yesterdayAmount = yesterdayData.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const amountComparison = yesterdayAmount
    ? ((totalAmount - yesterdayAmount) / yesterdayAmount) * 100
    : 0;

  // Prepare data for charts
  const dates = [...new Set(filteredData.map(item =>
    new Date(item.date_added).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  ))].sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));

  const amountTrend = dates.map(date =>
    filteredData
      .filter(item => new Date(item.date_added).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) === date)
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
  );

  const successRateTrend = dates.map(date => {
    const dailySuccess = filteredData
      .filter(item => new Date(item.date_added).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) === date)
      .reduce((count, item) => count + (item.transaction_status.toLowerCase() === 'success' ? 1 : 0), 0);
    const dailyTotal = filteredData
      .filter(item => new Date(item.date_added).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) === date)
      .length;
    return dailyTotal > 0 ? (dailySuccess / dailyTotal) * 100 : 0;
  });

  const commissionTrend = dates.map(date =>
    filteredData
      .filter(item => new Date(item.date_added).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) === date)
      .reduce((sum, item) => sum + parseFloat(item.commission || 0), 0)
  );

  console.log('Chart Data:', { dates, amountTrend, successRateTrend, commissionTrend });

  const amountChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Amount',
        data: amountTrend,
        borderColor: '#6366f1', // indigo-600
        backgroundColor: '#6366f1',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#6366f1',
        pointBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const successRateChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Success Rate (%)',
        data: successRateTrend,
        borderColor: '#10b981', // green-600
        backgroundColor: '#10b981',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#10b981',
        pointBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const commissionChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Commission',
        data: commissionTrend,
        borderColor: '#f59e0b', // yellow-500
        backgroundColor: '#f59e0b',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#f59e0b',
        pointBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          color: '#6b7280', // gray-600
        },
      },
      tooltip: {
        enabled: false,
        external: (context) => {
          let tooltipEl = document.getElementById('chartjs-tooltip');
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.className = 'bg-white p-3 rounded-lg shadow-lg border border-gray-200';
            document.body.appendChild(tooltipEl);
          }

          const tooltipModel = context.tooltip;
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          tooltipEl.style.opacity = '1';
          tooltipEl.style.position = 'absolute';
          tooltipEl.style.pointerEvents = 'none';

          if (tooltipModel.body) {
            const title = tooltipModel.title || [];
            const bodyLines = tooltipModel.body.map((b) => b.lines);
            let innerHtml = `<div class="text-sm text-gray-800 font-medium">${title[0]}</div>`;
            bodyLines.forEach((body, i) => {
              const label = tooltipModel.labelColors[i].borderColor;
              const value = body[0].split(': ')[1];
              const formattedValue =
                tooltipModel.dataPoints[i].dataset.label.includes('Success Rate')
                  ? `${parseFloat(value).toFixed(2)}%`
                  : `₹${parseFloat(value).toLocaleString()}`;
              innerHtml += `
                <div class="text-sm text-gray-600 flex items-center">
                  <span class="w-3 h-3 rounded-full mr-2" style="background-color: ${label}"></span>
                  ${tooltipModel.dataPoints[i].dataset.label}: ${formattedValue}
                </div>`;
            });
            tooltipEl.innerHTML = innerHtml;
          }

          const position = context.chart.canvas.getBoundingClientRect();
          tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
          tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 12 } },
      },
      y: {
        grid: { color: '#e5e7eb' },
        ticks: {
          color: '#6b7280',
          font: { size: 12 },
          callback: (value) => {
            const chart = context.chart;
            if (!chart) return value;
            return chart.data.datasets[0].label.includes('Success Rate')
              ? `${value}%`
              : `₹${value.toLocaleString()}`;
          },
        },
        beginAtZero: true,
        max: (context) =>
          context.chart && context.chart.data.datasets[0].label.includes('Success Rate')
            ? 100
            : undefined,
      },
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  };

  // Top operators by amount
  const operators = filteredData.reduce((acc, item) => {
    const operator = item.operator_name || 'Unknown';
    if (!acc[operator]) {
      acc[operator] = { amount: 0, commission: 0 };
    }
    acc[operator].amount += parseFloat(item.amount || 0);
    acc[operator].commission += parseFloat(item.commission || 0);
    return acc;
  }, {});

  const topOperators = Object.entries(operators)
    .map(([name, { amount, commission }]) => ({ name, amount, commission }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Export data as CSV with proper escaping
  const exportData = () => {
    const escapeCSV = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [
      [
        'Reference ID',
        'Transaction ID',
        'Operator Name',
        'Customer Number',
        'Amount',
        'Commission',
        'TDS',
        'Refunded',
        'Transaction Status',
        'Date Added',
      ],
      ...filteredData.map(item => [
        escapeCSV(item.reference_id || ''),
        escapeCSV(item.transaction_id || ''),
        escapeCSV(item.operator_name || ''),
        escapeCSV(item.customer_number || ''),
        item.amount || 0,
        item.commission || 0,
        item.tds || 0,
        item.refunded || 0,
        escapeCSV(item.transaction_status || ''),
        escapeCSV(new Date(item.date_added).toLocaleDateString()),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bill_payment_transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Bill Payment Dashboard</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Select time filter"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Start date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              onClick={exportData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
              aria-label="Export data as CSV"
            >
              Export Data
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                      amountComparison < 0 ? 'text-white bg-red-500' : 'text-white bg-green-500'
                    }`}
                  >
                    {amountComparison < 0 ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    )}
                    {amountComparison.toFixed(2)}%
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Total Transactions</h3>
                <p className="text-2xl font-bold text-gray-800">{totalTransactions}</p>
                <p className="text-xs text-gray-500 mt-1">vs. yesterday</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                      amountComparison < 0 ? 'text-white bg-red-500' : 'text-white bg-green-500'
                    }`}
                  >
                    {amountComparison < 0 ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    )}
                    {amountComparison.toFixed(2)}%
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Total Amount</h3>
                <p className="text-2xl font-bold text-gray-800">₹{totalAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">vs. yesterday (₹{yesterdayAmount.toLocaleString()})</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                      amountComparison < 0 ? 'text-white bg-red-500' : 'text-white bg-green-500'
                    }`}
                  >
                    {amountComparison < 0 ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    )}
                    {amountComparison.toFixed(2)}%
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Avg. Amount</h3>
                <p className="text-2xl font-bold text-gray-800">₹{parseFloat(avgAmount).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">vs. yesterday</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Percent className="h-5 w-5 text-purple-600" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                      parseFloat(successRate) < 50 ? 'text-white bg-red-500' : 'text-white bg-green-500'
                    }`}
                  >
                    {parseFloat(successRate) < 50 ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    )}
                    {successRate}%
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Success Rate</h3>
                <p className="text-2xl font-bold text-gray-800">{successRate}%</p>
                <p className="text-xs text-gray-500 mt-1">vs. yesterday</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                      amountComparison < 0 ? 'text-white bg-red-500' : 'text-white bg-green-500'
                    }`}
                  >
                    {amountComparison < 0 ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    )}
                    {amountComparison.toFixed(2)}%
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Total Commission</h3>
                <p className="text-2xl font-bold text-gray-800">₹{totalCommission.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">vs. yesterday</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-red-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-red-600" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                      amountComparison < 0 ? 'text-white bg-red-500' : 'text-white bg-green-500'
                    }`}
                  >
                    {amountComparison < 0 ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    )}
                    {amountComparison.toFixed(2)}%
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Total TDS</h3>
                <p className="text-2xl font-bold text-gray-800">₹{totalTds.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">vs. yesterday</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                      amountComparison < 0 ? 'text-white bg-red-500' : 'text-white bg-green-500'
                    }`}
                  >
                    {amountComparison < 0 ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    )}
                    {amountComparison.toFixed(2)}%
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Total Refunded</h3>
                <p className="text-2xl font-bold text-gray-800">₹{totalRefunded.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">vs. yesterday</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Amount Trend</h3>
                <div className="h-64">
                  {dates.length > 0 ? (
                    <Line
                      data={amountChartData}
                      options={chartOptions}
                      aria-label="Amount Trend Chart"
                    />
                  ) : (
                    <p className="text-sm text-gray-500 text-center">No data available</p>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Success Rate by Period</h3>
                <div className="h-64">
                  {dates.length > 0 ? (
                    <Line
                      data={successRateChartData}
                      options={chartOptions}
                      aria-label="Success Rate by Period Chart"
                    />
                  ) : (
                    <p className="text-sm text-gray-500 text-center">No data available</p>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Commission Trend</h3>
                <div className="h-64">
                  {dates.length > 0 ? (
                    <Line
                      data={commissionChartData}
                      options={chartOptions}
                      aria-label="Commission Trend Chart"
                    />
                  ) : (
                    <p className="text-sm text-gray-500 text-center">No data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Top Operators */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Top Operators by Amount</h3>
                <a
                  href="#"
                  className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  View More
                </a>
              </div>
              <div className="space-y-4">
                {topOperators.length > 0 ? (
                  topOperators.map((operator, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                          <span className="font-medium">{operator.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{operator.name}</p>
                          <p className="text-xs text-gray-500">Comm: ₹{operator.commission.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">₹{operator.amount.toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No operators available.</p>
                )}
              </div>
            </div>

            {/* Transaction Table */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left text-gray-600 font-medium">
                      <th className="p-3 border-b">Reference ID</th>
                      <th className="p-3 border-b">Transaction ID</th>
                      <th className="p-3 border-b">Operator Name</th>
                      <th className="p-3 border-b">Customer Number</th>
                      <th className="p-3 border-b">Amount (₹)</th>
                      <th className="p-3 border-b">Commission (₹)</th>
                      <th className="p-3 border-b">TDS (₹)</th>
                      <th className="p-3 border-b">Refunded (₹)</th>
                      <th className="p-3 border-b">Transaction Status</th>
                      <th className="p-3 border-b">Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-3 border-b">{item.reference_id || 'N/A'}</td>
                          <td className="p-3 border-b">{item.transaction_id || 'N/A'}</td>
                          <td className="p-3 border-b">{item.operator_name || 'N/A'}</td>
                          <td className="p-3 border-b">{item.customer_number || 'N/A'}</td>
                          <td className="p-3 border-b">₹{parseFloat(item.amount || 0).toLocaleString()}</td>
                          <td className="p-3 border-b">₹{parseFloat(item.commission || 0).toLocaleString()}</td>
                          <td className="p-3 border-b">₹{parseFloat(item.tds || 0).toLocaleString()}</td>
                          <td className="p-3 border-b">₹{parseFloat(item.refunded || 0).toLocaleString()}</td>
                          <td className="p-3 border-b">{item.transaction_status || 'N/A'}</td>
                          <td className="p-3 border-b">{new Date(item.date_added).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="p-3 text-center text-gray-500">
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
    </div>
  );
};

export default BillPaymentDashboard;