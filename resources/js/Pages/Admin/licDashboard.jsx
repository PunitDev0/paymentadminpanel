import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { startOfWeek, startOfMonth, format, parseISO } from "date-fns";
import { ArrowUp, ArrowDown, DollarSign, FileText, Percent, Filter } from "lucide-react";
import { getlicdata } from "@/lib/apis";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Licdashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const [timeRange, setTimeRange] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const licData = await getlicdata();
        console.log("Fetched LIC Data:", licData);
        setData(licData);
        setFilteredData(licData);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch LIC data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter and group data based on date range and time period
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Step 1: Filter by date range
    let filtered = data;
    if (startDate && endDate) {
      filtered = data.filter((item) => {
        const itemDate = new Date(item.created_at);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
    }

    // Step 2: Group data by time range
    let grouped = [];
    if (timeRange === "daily") {
      const groupedByDay = {};
      filtered.forEach((item) => {
        const date = parseISO(item.created_at);
        const dayKey = format(date, "yyyy-MM-dd");
        if (!groupedByDay[dayKey]) {
          groupedByDay[dayKey] = {
            date: dayKey,
            amount: 0,
            comm: 0,
            tds: 0,
            status: [],
          };
        }
        groupedByDay[dayKey].amount += parseFloat(item.amount || 0);
        groupedByDay[dayKey].comm += parseFloat(item.comm || 0);
        groupedByDay[dayKey].tds += parseFloat(item.tds || 0);
        groupedByDay[dayKey].status.push(item.status);
      });
      grouped = Object.entries(groupedByDay)
        .map(([date, values]) => ({
          date,
          amount: values.amount,
          comm: values.comm,
          tds: values.tds,
          successRate:
            values.status.length > 0
              ? (values.status.filter((s) => s === "1").length / values.status.length) * 100
              : 0,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (timeRange === "weekly") {
      const groupedByWeek = {};
      filtered.forEach((item) => {
        const date = parseISO(item.created_at);
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekKey = format(weekStart, "yyyy-MM-dd");
        if (!groupedByWeek[weekKey]) {
          groupedByWeek[weekKey] = {
            date: weekKey,
            amount: 0,
            comm: 0,
            tds: 0,
            status: [],
          };
        }
        groupedByWeek[weekKey].amount += parseFloat(item.amount || 0);
        groupedByWeek[weekKey].comm += parseFloat(item.comm || 0);
        groupedByWeek[weekKey].tds += parseFloat(item.tds || 0);
        groupedByWeek[weekKey].status.push(item.status);
      });
      grouped = Object.entries(groupedByWeek)
        .map(([date, values]) => ({
          date,
          amount: values.amount,
          comm: values.comm,
          tds: values.tds,
          successRate:
            values.status.length > 0
              ? (values.status.filter((s) => s === "1").length / values.status.length) * 100
              : 0,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (timeRange === "monthly") {
      const groupedByMonth = {};
      filtered.forEach((item) => {
        const date = parseISO(item.created_at);
        const monthStart = startOfMonth(date);
        const monthKey = format(monthStart, "yyyy-MM");
        if (!groupedByMonth[monthKey]) {
          groupedByMonth[monthKey] = {
            date: monthKey,
            amount: 0,
            comm: 0,
            tds: 0,
            status: [],
          };
        }
        groupedByMonth[monthKey].amount += parseFloat(item.amount || 0);
        groupedByMonth[monthKey].comm += parseFloat(item.comm || 0);
        groupedByMonth[monthKey].tds += parseFloat(item.tds || 0);
        groupedByMonth[monthKey].status.push(item.status);
      });
      grouped = Object.entries(groupedByMonth)
        .map(([date, values]) => ({
          date,
          amount: values.amount,
          comm: values.comm,
          tds: values.tds,
          successRate:
            values.status.length > 0
              ? (values.status.filter((s) => s === "1").length / values.status.length) * 100
              : 0,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setFilteredData(filtered);
    setGroupedData(grouped);
  }, [data, startDate, endDate, timeRange]);

  // Calculate summary metrics
  const totalPolicies = filteredData.length;
  const totalPremium = filteredData.reduce((sum, item) => {
    const amount = parseFloat(item.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  const avgPolicyValue = totalPolicies > 0 ? totalPremium / totalPolicies : 0;
  const successRate = totalPolicies > 0
    ? ((filteredData.filter((item) => item.status === "1").length / totalPolicies) * 100).toFixed(2)
    : 0;
  const totalCommission = filteredData
    .reduce((sum, item) => {
      const comm = parseFloat(item.comm);
      return sum + (isNaN(comm) ? 0 : comm);
    }, 0)
    .toFixed(2);
  const totalTDS = filteredData
    .reduce((sum, item) => {
      const tds = parseFloat(item.tds);
      return sum + (isNaN(tds) ? 0 : tds);
    }, 0)
    .toFixed(2);

  // Calculate comparison metrics for yesterday
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayData = data.filter((item) => {
    const itemDate = new Date(item.created_at);
    return (
      itemDate.getDate() === yesterday.getDate() &&
      itemDate.getMonth() === yesterday.getMonth() &&
      itemDate.getFullYear() === yesterday.getFullYear()
    );
  });
  const yesterdayPremium = yesterdayData.reduce((sum, item) => {
    const amount = parseFloat(item.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  const premiumComparison = yesterdayPremium
    ? ((totalPremium - yesterdayPremium) / yesterdayPremium) * 100
    : 0;

  // Prepare data for charts
  const chartLabels = groupedData.map((item) =>
    timeRange === "monthly" ? item.date : format(new Date(item.date), "MMM dd")
  );

  const premiumData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Premium Amount",
        data: groupedData.map((item) => item.amount),
        borderColor: "#6366f1", // indigo-600
        backgroundColor: "#6366f1",
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#6366f1",
        pointBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const successRateData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Success Rate (%)",
        data: groupedData.map((item) => item.successRate),
        backgroundColor: groupedData.map((_, index) => `rgba(16, 185, 129, ${0.8 + index * 0.02})`), // green-600 with opacity
        borderColor: "#10b981",
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };

  const commissionData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Commission Amount",
        data: groupedData.map((item) => item.comm),
        borderColor: "#f59e0b", // yellow-500
        backgroundColor: "#f59e0b",
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#f59e0b",
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
        position: "top",
        labels: {
          font: { size: 12 },
          color: "#6b7280", // gray-600
        },
      },
      tooltip: {
        enabled: false,
        external: (context) => {
          let tooltipEl = document.getElementById("chartjs-tooltip");
          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "chartjs-tooltip";
            tooltipEl.className = "bg-white p-3 rounded-lg shadow-lg border border-gray-200";
            document.body.appendChild(tooltipEl);
          }

          const tooltipModel = context.tooltip;
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = "0";
            return;
          }

          tooltipEl.style.opacity = "1";
          tooltipEl.style.position = "absolute";
          tooltipEl.style.pointerEvents = "none";

          if (tooltipModel.body) {
            const title = tooltipModel.title || [];
            const bodyLines = tooltipModel.body.map((b) => b.lines);
            let innerHtml = `<div class="text-sm text-gray-800 font-medium">${title[0]}</div>`;
            bodyLines.forEach((body, i) => {
              const label = tooltipModel.labelColors[i].borderColor;
              const value = body[0].split(": ")[1];
              const formattedValue =
                tooltipModel.dataPoints[i].dataset.label.includes("Success Rate")
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
          tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + "px";
          tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + "px";
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280", font: { size: 12 } },
      },
      y: {
        grid: { color: "#e5e7eb" },
        ticks: {
          color: "#6b7280",
          font: { size: 12 },
          callback: (value) => {
            const chart = context.chart;
            if (!chart) return value;
            return chart.data.datasets[0].label.includes("Success Rate")
              ? `${value}%`
              : `₹${value.toLocaleString()}`;
          },
        },
        beginAtZero: true,
        max: (context) =>
          context.chart && context.chart.data.datasets[0].label.includes("Success Rate")
            ? 100
            : undefined,
      },
    },
    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },
  };

  // Handle date filter application
  const handleDateFilter = () => {
    if (startDate && endDate) {
      const filtered = data.filter((item) => {
        const itemDate = new Date(item.created_at);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
      setFilteredData(filtered);
    }
  };

  // Calculate top insurers
  const insurers = {};
  filteredData.forEach((item) => {
    if (!item.operatorname) return;
    if (!insurers[item.operatorname]) {
      insurers[item.operatorname] = { premium: 0, comm: 0 };
    }
    const amount = parseFloat(item.amount);
    const comm = parseFloat(item.comm);
    insurers[item.operatorname].premium += isNaN(amount) ? 0 : amount;
    insurers[item.operatorname].comm += isNaN(comm) ? 0 : comm;
  });

  const sortedInsurers = Object.entries(insurers)
    .map(([name, { premium, comm }]) => ({ name, premium, comm }))
    .sort((a, b) => b.premium - a.premium)
    .slice(0, 5);

  // Export data as CSV
  const exportData = () => {
    const csv = filteredData
      .map(
        (row) =>
          `${row.id},${row.amount},${row.comm},${row.tds},${row.created_at},${row.status},${row.operatorname || ""}`
      )
      .join("\n");
    const csvFile = new Blob(
      [`id,amount,comm,tds,created_at,status,operatorname\n${csv}`],
      { type: "text/csv" }
    );
    const downloadLink = document.createElement("a");
    downloadLink.download = "lic_data.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">LIC Dashboard</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Select time range"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-100 rounded-full">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                  premiumComparison < 0 ? "text-white bg-red-500" : "text-white bg-green-500"
                }`}
              >
                {premiumComparison < 0 ? (
                  <ArrowDown className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUp className="h-3 w-3 mr-1" />
                )}
                {premiumComparison.toFixed(2)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Policies</h3>
            <p className="text-2xl font-bold text-gray-800">{totalPolicies}</p>
            <p className="text-xs text-gray-500 mt-1">vs. yesterday</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                  premiumComparison < 0 ? "text-white bg-red-500" : "text-white bg-green-500"
                }`}
              >
                {premiumComparison < 0 ? (
                  <ArrowDown className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUp className="h-3 w-3 mr-1" />
                )}
                {premiumComparison.toFixed(2)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Premium</h3>
            <p className="text-2xl font-bold text-gray-800">₹{totalPremium.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">vs. yesterday (₹{yesterdayPremium.toLocaleString()})</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 rounded-full">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                  premiumComparison < 0 ? "text-white bg-red-500" : "text-white bg-green-500"
                }`}
              >
                {premiumComparison < 0 ? (
                  <ArrowDown className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUp className="h-3 w-3 mr-1" />
                )}
                {premiumComparison.toFixed(2)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Avg. Policy Value</h3>
            <p className="text-2xl font-bold text-gray-800">₹{avgPolicyValue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">vs. yesterday</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <Percent className="h-5 w-5 text-purple-600" />
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                  parseFloat(successRate) < 50 ? "text-white bg-red-500" : "text-white bg-green-500"
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
                  premiumComparison < 0 ? "text-white bg-red-500" : "text-white bg-green-500"
                }`}
              >
                {premiumComparison < 0 ? (
                  <ArrowDown className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUp className="h-3 w-3 mr-1" />
                )}
                {premiumComparison.toFixed(2)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Commission</h3>
            <p className="text-2xl font-bold text-gray-800">₹{parseFloat(totalCommission).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">vs. yesterday</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 rounded-full">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                  premiumComparison < 0 ? "text-white bg-red-500" : "text-white bg-green-500"
                }`}
              >
                {premiumComparison < 0 ? (
                  <ArrowDown className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowUp className="h-3 w-3 mr-1" />
                )}
                {premiumComparison.toFixed(2)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total TDS</h3>
            <p className="text-2xl font-bold text-gray-800">₹{parseFloat(totalTDS).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">vs. yesterday</p>
          </div>
        </div>

        {/* Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Premium Amount Trend</h3>
            <div className="h-64">
              {chartLabels.length > 0 ? (
                <Line
                  data={premiumData}
                  options={chartOptions}
                  aria-label="Premium Amount Trend Chart"
                />
              ) : (
                <p className="text-sm text-gray-500 text-center">No data available</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Success Rate by Period</h3>
            <div className="h-64">
              {chartLabels.length > 0 ? (
                <Bar
                  data={successRateData}
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
              {chartLabels.length > 0 ? (
                <Line
                  data={commissionData}
                  options={chartOptions}
                  aria-label="Commission Trend Chart"
                />
              ) : (
                <p className="text-sm text-gray-500 text-center">No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Insurers */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Top Insurers by Premium</h3>
            <a
              href="#"
              className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              View More
            </a>
          </div>
          <div className="space-y-4">
            {sortedInsurers.length > 0 ? (
              sortedInsurers.map((insurer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                      <span className="font-medium">{insurer.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{insurer.name}</p>
                      <p className="text-xs text-gray-500">Comm: ₹{insurer.comm.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">₹{insurer.premium.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No insurers available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Licdashboard;