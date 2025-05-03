import { 
  HandCoins, BatteryCharging, ShieldCheck, Banknote, CreditCard, 
  Drill, CalendarRange, Cog, Users, Phone, GlobeLock, 
  ChartPie,
  Code,
  Building
} from 'lucide-react';

console.log(import.meta.env.VITE_APP_SERVER);
const BASE_URL = import.meta.env.VITE_APP_SERVER === "PRODUCTION" 
  ? "https://banking.nikatby.com/admin/public" 
  : "http://127.0.0.1:8000";

console.log(BASE_URL);

export const sidebarRoutes = [
    {
      id: "dashboard",
      title: "Dashboard",
      path: `${BASE_URL}/admin`,
      permissions: ["admin"],
    },
    {
      id: "recharge",
      title: "Recharge",
      icon: <ChartPie/>,
      path: `${BASE_URL}/admin/recharge/dashboard`,
      permissions: ["admin"],
      
    },
    // {
    //   id: "cms-airtel",
    //   title: "CMS-Airtel",
    //   path: "/admin/cms-airtel",
    //   icon: <Antenna/>,
    //   permissions: ["admin"],
    
    // },
    // {
    //   id: "bus-booking",
    //   title: "Bus Booking",
    //   path: "/admin/bus-booking",
    //   icon: <Bus/>,
    //   permissions: ["admin"],
    // },
   
    {
      id: "lic",
      title: "LIC",
      path: `${BASE_URL}/admin/lic`,
      icon: <Code/>,
      permissions: ["admin"],
    },
    // {
    //   id: "dmt-bank-1",
    //   title: "DMT Bank 1",
    //   path: "/admin/dmt-bank-1",
    //   icon: <Building/>,
    //   permissions: ["admin"],
    // },
    {
      id: "dmt-bank-2",
      title: "DMT Bank 2",
      path: `${BASE_URL}/admin/dmt-bank-2`,
      icon: <Building/>,
      permissions: ["admin"],
    },
    {
      id: "utilities",
      title: "Utilities",
      path: `${BASE_URL}/admin/utilities`,
      icon: <Drill />,
      permissions: ["admin"],
      subMenu: [
        {
          id: "utilities-billpayments",
          title: "Bill Payments",
          path: `${BASE_URL}/admin/utilities/bill-payment`,
          permissions: ["admin"],
        },
        // {
        //   id: "utilities-insurancepayments",
        //   title: "Insurance Payment",
        //   path: "/admin/utilities/insurance-payment",
        //   permissions: ["admin"],
        // }
        // ,
        {
          id: "utilities-fastagrecharge",
          title: "Fastag Recharge",
          path: `${BASE_URL}/admin/utilities/fastag-recharge`,
          permissions: ["admin"],
        }
        ,
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
        }

      ]
    },
    {
      id: "role&permission",
      title: "Roles & Permission",
      path: `${BASE_URL}/admin/displaypermissions`,
      icon: <Cog />,
      permissions: ["admin"],
      subMenu: [
        {
          id: "roles",
          title: "Roles",
          icon: <Cog />,
          path: `${BASE_URL}/admin/displayroles`,
          permissions: ["admin"],
        },
        {
          id: "permissions",
          title: "Permissions",
          icon: <Phone />,
          path: `${BASE_URL}/admin/displaypermissions`,
          permissions: ["admin"],
        }
      ]
    },
    {
      id: "commision",
      title: "Commission",
      path: `${BASE_URL}/admin/commission`,
      icon: <CalendarRange  />,
      permissions: ["admin"],
    },
    {
      id: "memberdetails",
      title: "Member Details",
      path: `${BASE_URL}/admin/members`,
      icon: <CalendarRange  />,
      permissions: ["admin"],
    },
    {
      id: "bankdetails",
      title: "Bank Details",
      path: `${BASE_URL}/admin/bank`,
      icon: <CalendarRange  />,
      permissions: ["admin"],
    }
  ];