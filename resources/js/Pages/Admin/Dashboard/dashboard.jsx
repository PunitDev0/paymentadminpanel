import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, ChevronLeft, ChevronRight, PlusCircle, MinusCircle, Users, CreditCard, TrendingUp, ShoppingBag, Database, ArrowUp, ArrowDown, IndianRupee, PieChart as PieChartIcon, Receipt, User } from 'lucide-react';
import { beneficiarylist1, beneficiarylist2, Recharge_Transaction } from '@/lib/apis';

const Dashboard = () => {
  const [currentMonth, setCurrentMonth] = useState('2025.05');
  const [searchTerm, setSearchTerm] = useState("");
  const [beneficary1, setBeneficary1] = useState([]);
  const [beneficary2, setBeneficary2] = useState([]);
  const [recharge, setRecharge] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalRechargeAmount = recharge?.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0) || 0;

  // State for calculated values
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [dailyIncrease, setDailyIncrease] = useState(0);
  const [weeklyIncrease, setWeeklyIncrease] = useState(0);

  // Calculate percentages dynamically
  useEffect(() => {
    const total = (beneficary1?.length || 0) + (beneficary2?.length || 0);
    setTotalBeneficiaries(total);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayCount = (beneficary1?.filter(b => b && new Date(b.created_at).toDateString() === today.toDateString())?.length || 0) +
                      (beneficary2?.filter(b => b && new Date(b.created_at).toDateString() === today.toDateString())?.length || 0);
    const yesterdayCount = (beneficary1?.filter(b => b && new Date(b.created_at).toDateString() === yesterday.toDateString())?.length || 0) +
                          (beneficary2?.filter(b => b && new Date(b.created_at).toDateString() === yesterday.toDateString())?.length || 0);

    const daily = yesterdayCount === 0 ? (todayCount > 0 ? 100 : 0) : ((todayCount - yesterdayCount) / yesterdayCount) * 100;
    setDailyIncrease(Math.round(daily));

    const dayOfWeek = today.getDay();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfThisWeek.setHours(0, 0, 0, 0);

    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);
    endOfLastWeek.setHours(23, 59, 59, 999);

    const startOfLastWeek = new Date(endOfLastWeek);
    startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
    startOfLastWeek.setHours(0, 0, 0, 0);

    const thisWeekCount = (beneficary1?.filter(b => b && new Date(b.created_at) >= startOfThisWeek && new Date(b.created_at) <= today)?.length || 0) +
                         (beneficary2?.filter(b => b && new Date(b.created_at) >= startOfThisWeek && new Date(b.created_at) <= today)?.length || 0);
    const lastWeekCount = (beneficary1?.filter(b => b && new Date(b.created_at) >= startOfLastWeek && new Date(b.created_at) <= endOfLastWeek)?.length || 0) +
                         (beneficary2?.filter(b => b && new Date(b.created_at) >= startOfLastWeek && new Date(b.created_at) <= endOfLastWeek)?.length || 0);

    const weekly = lastWeekCount === 0 ? (thisWeekCount > 0 ? 100 : 0) : ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100;
    setWeeklyIncrease(Math.round(weekly));
  }, [beneficary1, beneficary2]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [data1, data2, rechargeData] = await Promise.all([
          beneficiarylist1(),
          beneficiarylist2(),
          Recharge_Transaction()
        ]);
        setBeneficary1(data1 || []);
        setBeneficary2(data2 || []);
        setRecharge(rechargeData.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const walletData = {
    totalBalance: 39990,
    credited: 7800,
    debited: 4250,
    totalRecharge: 12340,
    commissionReceived: 2300,
    debitedFromRecharge: 11450,
    creditedToWallet: 3850
  };

  const userStats = {
    remittersAdded: 14,
    merchantsRegistered: 12,
    activeUsers: 98
  };

  const transactionData = [
    { month: '04/01', recharge: 1200, payment: 750, commission: 240 },
    { month: '04/08', recharge: 850, payment: 630, commission: 180 },
    { month: '04/15', recharge: 1400, payment: 900, commission: 320 },
    { month: '04/22', recharge: 980, payment: 720, commission: 210 },
    { month: '04/29', recharge: 1100, payment: 800, commission: 260 },
    { month: '05/05', recharge: 1350, payment: 830, commission: 290 },
    { month: '05/12', recharge: 1500, payment: 950, commission: 340 },
    { month: '05/19', recharge: 1200, payment: 880, commission: 310 }
  ];

  const merchantData = [
    { name: 'Merchant A', revenue: 8040616, transactions: 345 },
    { name: 'Merchant B', revenue: 6254103, transactions: 287 },
    { name: 'Merchant C', revenue: 4598721, transactions: 213 },
    { name: 'Merchant D', revenue: 7123548, transactions: 320 },
    { name: 'Merchant E', revenue: 5364812, transactions: 250 }
  ];

  const transactionTypes = [
    { type: 'Mobile Recharge', count: recharge.length, value: totalRechargeAmount },
    { type: 'LIC Payment', count: 120, value: 240000 },
    { type: 'Bus Booking', count: 210, value: 185000 },
    { type: 'DTH Recharge', count: 180, value: 65000 }
  ];

  const summaryData = [
    { label: "Total Wallet Balance", value: `₹${walletData.totalBalance.toLocaleString()}`, icon: IndianRupee },
    { label: "Total Transactions", value: "1,200", icon: PieChartIcon },
    { label: "Total Commission", value: `₹${walletData.commissionReceived.toLocaleString()}`, icon: Receipt },
    { label: "Active Users", value: userStats.activeUsers.toString(), icon: User },
  ];

  const bookingData = {
    busTotalBookings: 130,
    busRevenue: 120000,
    busCommission: 9600
  };

  const recentTransactions = [
    { id: 1, type: 'Credit', amount: 1250, date: '2025-05-04', description: 'Commission' },
    { id: 2, type: 'Debit', amount: 3200, date: '2025-05-03', description: 'Recharge' },
    { id: 3, type: 'Credit', amount: 5000, date: '2025-05-02', description: 'Wallet Load' },
    { id: 4, type: 'Debit', amount: 1800, date: '2025-05-01', description: 'LIC Payment' }
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const calendarData = [
    [null, null, null, null, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31]
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handleMonthChange = (direction) => {
    const [year, month] = currentMonth.split('.').map(Number);
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setCurrentMonth(`${newYear}.${newMonth.toString().padStart(2, '0')}`);
  };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-800">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600">
              {`${entry.name}: ${entry.dataKey === 'count' ? entry.value.toLocaleString() : `₹${entry.value.toLocaleString()}`}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom PieChart Label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {loading ? (
          <div className="text-center p-8 text-gray-500">Loading...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {summaryData.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{item.label}</p>
                        <p className="text-2xl font-bold text-gray-800 mt-2">{item.value}</p>
                      </div>
                      <div className="p-3 bg-indigo-100 rounded-full">
                        <Icon className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metrics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">₹{walletData.totalBalance.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">+6%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">+10.4% vs last week</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Users Added</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{userStats.remittersAdded} Users</p>
                  </div>
                  <div className="flex items-center text-indigo-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">+2%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">+3.4% vs last week</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Beneficiaries Added</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{totalBeneficiaries} accounts</p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">+{dailyIncrease}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">+{weeklyIncrease}% vs last week</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">₹{walletData.commissionReceived.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center text-red-600">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">-3%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">-2.1% vs last week</p>
              </div>
            </div>

            {/* Calendar and Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Sales Calendar</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMonthChange(-1)}
                      className="p-1 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <span className="text-sm font-medium text-gray-700">{currentMonth}</span>
                    <button
                      onClick={() => handleMonthChange(1)}
                      className="p-1 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>
                  ))}
                  {calendarData.flat().map((day, i) => (
                    <div
                      key={i}
                      className={`text-center py-2 text-sm rounded-full transition-colors duration-200 ${
                        day === 15 ? 'bg-indigo-600 text-white' :
                        day === 22 ? 'bg-indigo-500 text-white' :
                        day ? 'hover:bg-gray-100 cursor-pointer text-gray-700' : ''
                      }`}
                    >
                      {day || ''}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Transaction Results</h3>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">View More</a>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={transactionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="recharge"
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                      animationDuration={800}
                      name="Recharge"
                    >
                      {transactionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fillOpacity={0.8 + index * 0.02} />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="payment"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                      animationDuration={800}
                      name="Payment"
                    >
                      {transactionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fillOpacity={0.8 + index * 0.02} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Merchant, Transaction Types, Wallet */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Merchant Analysis</h3>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">View More</a>
                </div>
                <div className="space-y-4">
                  {merchantData.slice(0, 3).map((merchant, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">{merchant.name}</span>
                        <span className="font-semibold text-gray-800">₹{merchant.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${(merchant.revenue / 10000000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Transaction Types</h3>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">View More</a>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    layout="vertical"
                    data={transactionTypes}
                    margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={(value) => value.toLocaleString()} />
                    <YAxis dataKey="type" type="category" stroke="#6b7280" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="#60a5fa"
                      radius={[0, 6, 6, 0]}
                      barSize={30}
                      animationDuration={800}
                    >
                      {transactionTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fillOpacity={0.8 + index * 0.02} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Wallet Summary</h3>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">View More</a>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-full mr-3">
                        <PlusCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Credited Amount</span>
                    </div>
                    <span className="font-semibold text-green-600">₹{walletData.credited.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-full mr-3">
                        <MinusCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Debited Amount</span>
                    </div>
                    <span className="font-semibold text-red-600">₹{walletData.debited.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="p-2 bg-indigo-100 rounded-full mr-3">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Commission Earned</span>
                    </div>
                    <span className="font-semibold text-indigo-600">₹{walletData.commissionReceived.toLocaleString()}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Balance</span>
                      <span className="text-lg font-bold text-gray-800">₹{walletData.totalBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bus Booking, Recent Transactions, User Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Bus Booking Statistics</h3>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">View More</a>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShoppingBag className="h-5 w-5 text-indigo-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">Total Bookings</span>
                    </div>
                    <span className="font-semibold text-gray-800">{bookingData.busTotalBookings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 text-indigo-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                    </div>
                    <span className="font-semibold text-gray-800">₹{bookingData.busRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-indigo-600 mr-3" />
                      <span className="text-sm font-medium text-gray-700">Commission Earned</span>
                    </div>
                    <span className="font-semibold text-gray-800">₹{bookingData.busCommission.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">View More</a>
                </div>
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          {tx.type === 'Credit' ? (
                            <PlusCircle className="h-5 w-5 text-green-600 mr-3" />
                          ) : (
                            <MinusCircle className="h-5 w-5 text-red-600 mr-3" />
                          )}
                          <span className="text-sm font-medium text-gray-700">{tx.description}</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-8">{tx.date}</div>
                      </div>
                      <span className={`font-semibold ${tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'Credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">User Statistics</h3>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">View More</a>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Remitters', value: userStats.remittersAdded, fill: '#6366f1' },
                        { name: 'Merchants', value: userStats.merchantsRegistered, fill: '#f59e0b' },
                        { name: 'Active Users', value: userStats.activeUsers, fill: '#10b981' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={renderCustomizedLabel}
                      labelLine={false}
                      animationDuration={800}
                    >
                      {[
                        { name: 'Remitters', value: userStats.remittersAdded, fill: '#6366f1' },
                        { name: 'Merchants', value: userStats.merchantsRegistered, fill: '#f59e0b' },
                        { name: 'Active Users', value: userStats.activeUsers, fill: '#10b981' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fillOpacity={0.8 + index * 0.05} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-700">Remitters</span>
                    </div>
                    <span className="font-semibold text-gray-800">{userStats.remittersAdded}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-700">Merchants</span>
                    </div>
                    <span className="font-semibold text-gray-800">{userStats.merchantsRegistered}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-700">Active Users</span>
                    </div>
                    <span className="font-semibold text-gray-800">{userStats.activeUsers}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;