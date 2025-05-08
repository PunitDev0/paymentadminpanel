import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight, LayoutDashboard, ChartPie, Code, Building, Drill, Cog, CalendarRange, Users, Banknote, Import, Network } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_APP_SERVER === "PRODUCTION"
  ? "https://banking.nikatby.com/admin/public"
  : "http://127.0.0.1:8000";

export const sidebarRoutes = [
  {
    id: "dashboard",
    title: "Dashboard",
    path: `${BASE_URL}/admin`,
    icon: <LayoutDashboard className="h-5 w-5" />,
    permissions: ["admin"],
  },
  {
    id: "recharge",
    title: "Recharge",
    icon: <ChartPie className="h-5 w-5" />,
    path: `${BASE_URL}/admin/recharge/dashboard`,
    permissions: ["admin"],
  },
  {
    id: "lic",
    title: "LIC",
    path: `${BASE_URL}/admin/lic`,
    icon: <Code className="h-5 w-5" />,
    permissions: ["admin"],
  },
  {
    id: "dmt-bank-2",
    title: "DMT Bank 2",
    path: `${BASE_URL}/admin/dmt-bank-2`,
    icon: <Building className="h-5 w-5" />,
    permissions: ["admin"],
  },
  {
    id: "utilities",
    title: "Utilities",
    path: `${BASE_URL}/admin/utilities`,
    icon: <Drill className="h-5 w-5" />,
    permissions: ["admin"],
    subMenu: [
      {
        id: "utilities-billpayments",
        title: "Bill Payments",
        path: `${BASE_URL}/admin/utilities/bill-payment`,
        permissions: ["admin"],
      },
      {
        id: "utilities-fastagrecharge",
        title: "Fastag Recharge",
        path: `${BASE_URL}/admin/utilities/fastag-recharge`,
        permissions: ["admin"],
      },
      {
        id: "utilities-lpgbooking",
        title: "LPG Booking and Payment",
        path: `${BASE_URL}/admin/utilities/lpg-booking`,
        permissions: ["admin"],
      },
      {
        id: "utilities-municipalitypayment",
        title: "Municipality Payment",
        path: `${BASE_URL}/admin/utilities/municipality-payment`,
        permissions: ["admin"],
      },
    ],
  },
  {
    id: "role&permission",
    title: "Roles & Permission",
    path: `${BASE_URL}/admin/displaypermissions`,
    icon: <Cog className="h-5 w-5" />,
    permissions: ["admin"],
    subMenu: [
      {
        id: "roles",
        title: "Roles",
        path: `${BASE_URL}/admin/displayroles`,
        permissions: ["admin"],
      },
      {
        id: "permissions",
        title: "Permissions",
        path: `${BASE_URL}/admin/displaypermissions`,
        permissions: ["admin"],
      },
    ],
  },
  {
    id: "commision",
    title: "Commission",
    path: `${BASE_URL}/admin/commission`,
    icon: <CalendarRange className="h-5 w-5" />,
    permissions: ["admin"],
  },
  {
    id: "memberdetails",
    title: "Member Details",
    path: `${BASE_URL}/admin/members`,
    icon: <Users className="h-5 w-5" />,
    permissions: ["admin"],
  },
  {
    id: "bankdetails",
    title: "Bank Details",
    path: `${BASE_URL}/admin/bank`,
    icon: <Banknote className="h-5 w-5" />,
    permissions: ["admin"],
  },
  {
    id: "whitelistingip",
    title: "Whitelisting Ips",
    path: `${BASE_URL}/admin/whitelisted-ips`,
    icon: <Network className="h-5 w-5" />,
    permissions: ["admin"],
  },
];

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const { url } = usePage();
  const isActive = (path) => {
    return window.location.pathname === path || window.location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`h-screen bg-gray-900 text-white w-72 z-[1000] flex flex-col fixed left-0 top-0 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:w-72 z-40 shadow-xl border-r border-indigo-800/50`}
      >
        <div className="p-6 border-b ">
          <h2 className="text-2xl font-bold tracking-tight text-indigo-100">Admin Dashboard</h2>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {sidebarRoutes.map((route) => (
              <li key={route.id}>
                {route.subMenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(route.id)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-left hover:bg-indigo-800 hover:text-indigo-100 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isActive(route.path) ? 'bg-indigo-800 text-indigo-300' : 'text-indigo-200'
                      }`}
                      aria-expanded={openMenus[route.id] ? 'true' : 'false'}
                      aria-controls={`submenu-${route.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {route.icon}
                        <span className="text-sm font-medium">{route.title}</span>
                      </div>
                      <span className="transition-transform duration-200">
                        {openMenus[route.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openMenus[route.id] ? 'max-h-96' : 'max-h-0'
                      }`}
                    >
                      <ul id={`submenu-${route.id}`} className="pl-8 mt-2 space-y-1">
                        {route.subMenu.map((subItem) => (
                          <li key={subItem.id}>
                            <Link
                              href={subItem.path}
                              className={`block px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 hover:text-indigo-100 transition-all duration-200 transform hover:scale-[1.02] ${
                                isActive(subItem.path) ? 'bg-indigo-700 text-indigo-300' : 'text-indigo-200'
                              }`}
                              onClick={() => toggleSidebar()}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={route.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 hover:text-indigo-100 transition-all duration-200 transform hover:scale-[1.02] ${
                      isActive(route.path) ? 'bg-indigo-800 text-indigo-300' : 'text-indigo-200'
                    }`}
                    onClick={() => toggleSidebar()}
                  >
                    {route.icon}
                    <span className="text-sm font-medium">{route.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overlay for Mobile when Sidebar is Open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-30 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
};

export default Sidebar;