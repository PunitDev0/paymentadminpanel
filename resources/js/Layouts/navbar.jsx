import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Wallet, CreditCard, LogOut, Menu, X } from 'lucide-react';
import { balanceApi } from '@/lib/apis';
import axios from 'axios';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [walletBalance, setWalletBalance] = useState(null);
  const [BBPSBalance, setBBPSBalance] = useState(null);
  const [creditBalance, setCreditBalance] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isLoadingCredit, setIsLoadingCredit] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const BASE_URL = import.meta.env.VITE_APP_SERVER === "PRODUCTION"
    ? "https://banking.nikatby.com/admin/public"
    : "http://127.0.0.1:8000";

  // Fetch wallet balance
  useEffect(() => {
    const fetchBBSBalance = async () => {
      try {
        setIsLoadingWallet(true);
        const result = axios.get('https://banking.peunique.com/api/balanceCheck')
        console.log(result);
        
        if (result.data) {
          setBBPSBalance(result.data.currentBalance);
        } else {
          setBBPSBalance('Error');
          console.error('Wallet Balance Error:', result.message);
        }
      } catch (error) {
        setBBPSBalance('Error');
        console.error('Wallet Balance Fetch Error:', error);
      } finally {
        setIsLoadingWallet(false);
      }
    };

    fetchBBSBalance();
  }, []);
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
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <header className="bg-white shadow-md py-3 px-4 sm:px-6 flex items-center justify-between gap-4 z-50 border-b border-indigo-100">
      {/* Left Section: Menu and Search */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Hamburger Menu for lg and below */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 active:bg-indigo-300 transition-transform duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6 text-indigo-700" />
          ) : (
            <Menu className="h-6 w-6 text-indigo-700" />
          )}
        </button>

        {/* Search Bar */}
        {/* <div className="relative hidden sm:flex sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full transition-colors duration-200"
            aria-label="Search dashboard"
          />
        </div> */}
        {/* <div className="relative sm:hidden">
          <button
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Toggle search"
            aria-expanded={isSearchOpen}
          >
            <Search className="h-5 w-5 text-gray-500" />
          </button>
          <div
            className={`${
              isSearchOpen ? 'block' : 'hidden'
            } absolute top-14 left-0 w-full px-4 z-20 bg-white shadow-lg rounded-lg transition-all duration-300 ease-in-out`}
          >
            <Search className="absolute left-7 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search dashboard..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
              onBlur={() => setIsSearchOpen(false)}
              aria-label="Search dashboard"
            />
          </div>
        </div> */}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-wrap justify-end">
        {/* Credit Balance */}
        <div className="flex items-center gap-2 bg-blue-50 p-2 sm:p-3 rounded-lg hover:bg-blue-100 transition-colors duration-200 border border-blue-200 min-w-[130px] sm:min-w-[150px]">
          <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-600 font-medium">BBPS Balance</p>
            <p className={`text-sm font-semibold ${isLoadingCredit ? 'text-gray-400 animate-pulse' : 'text-blue-700'}`}>
              {isLoadingCredit ? 'Loading...' : BBPSBalance}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 p-2 sm:p-3 rounded-lg hover:bg-blue-100 transition-colors duration-200 border border-blue-200 min-w-[130px] sm:min-w-[150px]">
          <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-600 font-medium">Credit Balance</p>
            <p className={`text-sm font-semibold ${isLoadingCredit ? 'text-gray-400 animate-pulse' : 'text-blue-700'}`}>
              {isLoadingCredit ? 'Loading...' : formatBalance(creditBalance)}
            </p>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="flex items-center gap-2 bg-green-50 p-2 sm:p-3 rounded-lg hover:bg-green-100 transition-colors duration-200 border border-green-200 min-w-[100px] sm:min-w-[150px]">
          <Wallet className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-600 font-medium truncate">Wallet Balance</p>
            <p className={`text-sm font-semibold ${isLoadingWallet ? 'text-gray-400 animate-pulse' : 'text-green-700'}`}>
              {isLoadingWallet ? 'Loading...' : formatBalance(walletBalance)}
            </p>
          </div>
        </div>

        {/* Notifications */} 
        {/* <button
          className="p-2 rounded-full hover:bg-gray-100 relative flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse">
            3
          </span>
        </button> */}

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
            aria-label="User menu"
            aria-expanded={isUserMenuOpen}
          >
            <div className="bg-gray-200 rounded-full p-2 flex-shrink-0">
              <User className="h-5 w-5 text-gray-700" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-30 border border-gray-100 animate-fade-in">
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;