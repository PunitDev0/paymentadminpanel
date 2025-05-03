import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Wallet, CreditCard, LogOut } from 'lucide-react';
import { balanceApi } from '@/lib/apis';
import axios from 'axios';

const Navbar = () => {
  const [walletBalance, setWalletBalance] = useState(null);
  const [creditBalance, setCreditBalance] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isLoadingCredit, setIsLoadingCredit] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const BASE_URL = import.meta.env.VITE_APP_SERVER === "PRODUCTION" 
  ? "https://banking.nikatby.com/admin/public" 
  : "http://127.0.0.1:8000";

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setIsLoadingWallet(true);
        const result = await balanceApi.getWalletBalance();
        if (result.success) {
          setWalletBalance(result.balance);
        } else {
          setWalletBalance('Error');
          console.error('Wallet Balance Error:', result.message);
        }
      } catch (error) {
        setWalletBalance('Error');
        console.error('Wallet Balance Fetch Error:', error);
      } finally {
        setIsLoadingWallet(false);
      }
    };

    fetchWalletBalance();
  }, []);

  // Fetch credit balance
  useEffect(() => {
    const fetchCreditBalance = async () => {
      try {
        setIsLoadingCredit(true);
        const result = await balanceApi.getCreditBalance();
        if (result.success) {
          setCreditBalance(result.balance);
        } else {
          setCreditBalance('Error');
          console.error('Credit Balance Error:', result.message);
        }
      } catch (error) {
        setCreditBalance('Error');
        console.error('Credit Balance Fetch Error:', error);
      } finally {
        setIsLoadingCredit(false);
      }
    };

    fetchCreditBalance();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout Error:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  // Helper function to format balance
  const formatBalance = (balance) => {
    if (balance === null || balance === 'Error') return 'N/A';
    return `₹${Number(balance).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <header className="bg-white shadow-sm py-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="flex items-center w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <button
            className="sm:hidden p-2"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5 text-gray-400" />
          </button>
          <div
            className={`${
              isSearchOpen ? 'block' : 'hidden'
            } sm:block absolute sm:static top-12 left-0 w-full sm:w-auto px-4 sm:px-0 z-10 bg-white sm:bg-transparent`}
          >
            <Search className="absolute left-7 sm:left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              onBlur={() => setIsSearchOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center sm:justify-end">
        {/* Credit Balance */}
        <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-md min-w-[120px]">
          <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-600">Credit Balance</p>
            <p className={`text-sm font-semibold ${isLoadingCredit ? 'text-gray-400' : 'text-blue-700'}`}>
              {isLoadingCredit ? 'Loading...' : formatBalance(creditBalance)}
            </p>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="flex items-center gap-2 bg-green-50 p-2 rounded-md min-w-[120px]">
          <Wallet className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-600">Wallet Balance</p>
            <p className={`text-sm font-semibold ${isLoadingWallet ? 'text-gray-400' : 'text-green-700'}`}>
              {isLoadingWallet ? 'Loading...' : formatBalance(walletBalance)}
            </p>
          </div>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-gray-100 relative flex-shrink-0">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">3</span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="bg-gray-200 rounded-full p-2 flex-shrink-0">
            <User className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0"
          title="Logout"
        >
          <LogOut className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;