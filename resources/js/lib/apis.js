import axios from 'axios';

// Define the base URL based on the environment
const BASE_URL = import.meta.env.VITE_APP_SERVER === "PRODUCTION" 
    ? "https://banking.nikatby.com/admin/public" 
    : "http://127.0.0.1:8000";

// Ensure cookies are sent with requests (for session-based authentication)
axios.defaults.withCredentials = true;

// Recharge APIs
export const OperatorList = async () => {
    const operatorList = await axios.post(`${BASE_URL}/admin/recharge/operators`);
    return operatorList;
};

export const Recharge_Transaction = async () => {
    const response = await axios.post(`${BASE_URL}/admin/recharge/transaction`);
    return response;
};

export const fetchAllRechargeCommission = async () => {
    const response = await axios.post(`${BASE_URL}/admin/recharge/commission`);
    console.log(response.data);
    return response;
};

export const fetchRateData = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/api/commission-rate/${id}`); // Using fetch instead of axios
        const rateInfo = await response.json();
        setRateData((prev) => ({
            ...prev,
            [id]: { rate: rateInfo.rate, type: rateInfo.type },
        }));
    } catch (error) {
        console.error("Error fetching rate data:", error);
    }
};

export const updateRechargeCommission = async (operatorId, updatedData) => {
    try {
        const response = await axios.put(`${BASE_URL}/admin/update-commission-recharge/${operatorId}`, updatedData, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating commission:", error.response?.data || error.message);
        throw error;
    }
};

// CMS Airtel API
export const fetchAllCMSAirtel = async () => {
    const response = await axios.post(`${BASE_URL}/admin/cms-airtel-fetch`);
    console.log(response.data);
    return response;
};

// Utility API
export const utilityList = async () => {
    const response = await axios.post(`${BASE_URL}/admin/utility/commission`);
    console.log(response.data);
    return response;
};

export const UpdateUtilityCommission = async (operatorId, updatedData) => {
    try {
        const response = await axios.put(`${BASE_URL}/admin/update-commission-utility/${operatorId}`, updatedData, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating commission:", error.response?.data || error.message);
        throw error;
    }
};

// Gas and Fastag API
export const gasfastagList = async () => {
    const response = await axios.post(`${BASE_URL}/admin/gasfastag/commission`);
    console.log(response.data);
    return response;
};

export const UpdategasfastagCommission = async (id, updatedData) => {
    try {
        const response = await axios.put(`${BASE_URL}/admin/update-commission-gasfastag/${id}`, updatedData, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating commission:", error.response?.data || error.message);
        throw error;
    }
};

// CMS API
export const CmsList = async () => {
    const response = await axios.post(`${BASE_URL}/admin/cms/commission`);
    console.log(response.data);
    return response;
};

export const UpdateCMSCommission = async (agentID, updatedData) => {
    try {
        const response = await axios.put(`${BASE_URL}/admin/update-commission-cms/${agentID}`, updatedData, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating commission:", error.response?.data || error.message);
        throw error;
    }
};

// DMT API
export const Bank1List = async () => {
    const response = await axios.post(`${BASE_URL}/admin/dmt-bank1/commission`);
    console.log(response.data);
    return response;
};

export const Bank2List = async () => {
    const response = await axios.post(`${BASE_URL}/admin/dmt-bank2/commission`);
    console.log(response.data);
    return response;
};

export const UpdateBankCommission = async (id, updatedData) => {
    try {
        const response = await axios.put(`${BASE_URL}/admin/update-commission-bank/${id}`, updatedData, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating commission:", error.response?.data || error.message);
        throw error;
    }
};

// Beneficiary
export const beneficiarylist1 = async () => {
    const response = await axios.post(`${BASE_URL}/admin/beneficiary1`);
    return response.data.data;
};

export const beneficiarylist2 = async () => {
    const response = await axios.post(`${BASE_URL}/admin/beneficiary2`);
    return response.data.data;
};

// Permissions
export const getPermissions = async () => {
    const response = await axios.post(`${BASE_URL}/admin/permissions`);
    return response.data.data;
};

export async function addPermission(permissionData) {
    try {
        console.log('Sending add permission data:', permissionData);
        const res = await axios.post(`${BASE_URL}/admin/addnew/permission`, permissionData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        console.log('Add permission response:', res.data);
        return res.data;
    } catch (error) {
        console.error('Error adding permission:', error.response?.data || error.message);
        throw error;
    }
};

export async function updatePermission(id, updatedFields) {
    try {
        console.log('Sending update permission data:', { id, updatedFields });
        const res = await axios.post(`${BASE_URL}/admin/update/permission/${id}`, updatedFields, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        console.log('Update permission response:', res.data);
        return res.data;
    } catch (error) {
        console.error('Error updating permission:', error.response?.data || error.message);
        throw error;
    }
};

export async function deletePermission(id) {
    try {
        console.log('Sending delete permission request for id:', id);
        const res = await axios.post(`${BASE_URL}/admin/delete/permission/${id}`);
        console.log('Delete permission response:', res.data);
        return res.data;
    } catch (error) {
        console.error('Error deleting permission:', error.response?.data || error.message);
        throw error;
    }
};

// Roles
export async function getRoles() {
    try {
        const res = await axios.post(`${BASE_URL}/admin/roles`);
        return res.data.data;
    } catch (error) {
        console.error('Error fetching roles:', error.response?.data || error.message);
        throw error;
    }
};

export async function addRole(roleData) {
    try {
        console.log('Sending add role data to API:', roleData);
        const res = await axios.post(`${BASE_URL}/admin/addnew/role`, roleData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        console.log('Add role API response:', res.data);
        return res.data;
    } catch (error) {
        console.error('Error adding role:', error.response?.data || error.message);
        throw error;
    }
};

export async function updateRole(id, updatedFields) {
    try {
        console.log('Sending update role data to API:', { id, updatedFields });
        const res = await axios.post(`${BASE_URL}/admin/update/role/${id}`, updatedFields, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        console.log('Update role API response:', res.data);
        return res.data;
    } catch (error) {
        console.error('Error updating role:', error.response?.data || error.message);
        throw error;
    }
};

export async function deleteRole(id) {
    try {
        console.log('Sending delete role request for id:', id);
        const res = await axios.post(`${BASE_URL}/admin/delete/role/${id}`);
        console.log('Delete role API response:', res.data);
        return res.data;
    } catch (error) {
        console.error('Error deleting role:', error.response?.data || error.message);
        throw error;
    }
};

export async function updateRolePermissions(roleId, permissionIds) {
    try {
        console.log('Sending update role permissions data:', { roleId, permissionIds });
        const res = await axios.post(`${BASE_URL}/admin/role/${roleId}/permissions`, { permissions: permissionIds }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        console.log('Update role permissions API response:', res.data);
        return res.data;
    } catch (error) {
        console.error('Error updating role permissions:', error.response?.data || error.message);
        throw error;
    }
};

// DMT Banks
export async function getdmtbank2data() {
    try {
        const res = await axios.post(`${BASE_URL}/admin/dmt-bank-2/fetchdata`);
        return res.data.data;
    } catch (error) {
        console.error('Error fetching roles:', error.response?.data || error.message);
        throw error;
    }
};

export async function getlicdata() {
    try {
        const res = await axios.post(`${BASE_URL}/admin/lic/fetch`);
        return res.data.data;
    } catch (error) {
        console.error('Error fetching roles:', error.response?.data || error.message);
        throw error;
    }
};

export async function getMunicipalitydata() {
    try {
        const res = await axios.post(`${BASE_URL}/admin/utilities/municipality-payment-data`);
        return res.data.data;
    } catch (error) {
        console.error('Error fetching roles:', error.response?.data || error.message);
        throw error;
    }
};

export async function getBillpaymentdata() {
    try {
        const res = await axios.post(`${BASE_URL}/admin/utilities/bill-payment-data`);
        return res.data.data;
    } catch (error) {
        console.error('Error fetching roles:', error.response?.data || error.message);
        throw error;
    }
};

export async function getLPGdata() {
    try {
        const res = await axios.post(`${BASE_URL}/admin/utilities/lpg-booking-data`);
        return res.data.data;
    } catch (error) {
        console.error('Error fetching roles:', error.response?.data || error.message);
        throw error;
    }
};

export async function getInsurancedata() {
    try {
        const res = await axios.post(`${BASE_URL}/admin/utilities/insurance-payment-data`);
        return res.data.data;
    } catch (error) {
        console.error('Error fetching roles:', error.response?.data || error.message);
        throw error;
    }
};

export async function getFastagdata() {
    try {
        const res = await axios.post(`${BASE_URL}/admin/utilities/fastag-recharge-data`);
        return res.data.data;
    } catch (error) {
        console.error('Error fetching roles:', error.response?.data || error.message);
        throw error;
    }
};

// Members Details
export const getAllMembers = async () => {
    try {
        const response = await axios.post(`${BASE_URL}/admin/member/fetchdetails`);
        return response.data;
    } catch (error) {
        console.error('Error fetching members:', error);
        throw error;
    }
};

export const addMember = async (memberData) => {
    try {
        const response = await axios.post(`${BASE_URL}/admin/member/add`, memberData);
        return response.data;
    } catch (error) {
        console.error('Error adding member:', error);
        throw error;
    }
};

export const deleteMember = async (id, userType) => {
    try {
        const response = await axios.delete(`${BASE_URL}/admin/member/delete/${id}`, {
            data: { user_type: userType },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting member:', error);
        throw error;
    }
};


export const getCommissions = async () => {
    try {
        const response = await axios.get('/commissions');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch commissions');
    }
};

export const updateCommissions = async (changedData) => {
    const promises = Object.keys(changedData).map(async (commissionType) => {
        const type = commissionType.replace('_commissions', '');
        try {
            const response = await axios.post(`/commissions/${type}`, changedData[commissionType]);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update ${commissionType}`);
        }
    });

    return Promise.all(promises);
};

//bankdetails

export const getAllBankDetails = async () => {
    try {
        const response = await axios.post(`${BASE_URL}/admin/bank/fetchbankdetails`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching members:', error);
        throw error;
    }
};

export const activateBank = async (bankId) => {
    try {
      const response = await axios.post(`${BASE_URL}/admin/bank/activate`, { id: bankId });
      return response.data;
    } catch (error) {
      console.error('Error activating bank:', error);
      throw error;
    }
  };
  
export const deactivateBank = async (bankId) => {
    try {
      const response = await axios.post(`${BASE_URL}/admin/bank/deactivate`, { id: bankId });
      return response.data;
    } catch (error) {
      console.error('Error deactivating bank:', error);
      throw error;
    }
  };

export const balanceApi = {
    /**
     * Fetch wallet balance
     * @returns {Promise<{success: boolean, balance: number, message?: string}>}
     */
    getWalletBalance: async () => {
      try {
        const response = await axios.get(route('admin.wallet-balance'));
        return response.data;
      } catch (error) {
        console.error('Wallet Balance Fetch Error:', error);
        return {
          success: false,
          balance: null,
          message: error.response?.data?.message || 'Failed to fetch wallet balance'
        };
      }
    },
  
    /**
     * Fetch credit balance
     * @returns {Promise<{success: boolean, balance: number, message?: string}>}
     */
    getCreditBalance: async () => {
      try {
        const response = await axios.get(route('admin.credit-balance'));
    return response.data;
      } catch (error) {
        console.error('Credit Balance Fetch Error:', error);
        return {
          success: false,
          balance: null,
          message: error.response?.data?.message || 'Failed to fetch credit balance'
        };
      }
    }
}



  
  // New functions for payment requests
  export const getAllPaymentRequests = async () => {
    try {
      const response = await axios.get('/payment-requests'); // No baseURL
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      throw error;
    }
  };
  
  export const approvePaymentRequest = async (requestId) => {
    try {
      const response = await axios.post(`/payment-requests/${requestId}/approve`); // Exact route
      return response.data;
    } catch (error) {
      console.error(`Error approving payment request ${requestId}:`, error);
      throw error;
    }
  };
  
  export const disapprovePaymentRequest = async (requestId) => {
    try {
      const response = await axios.post(`/payment-requests/${requestId}/disapprove`); // Exact route
      return response.data;
    } catch (error) {
      console.error(`Error disapproving payment request ${requestId}:`, error);
      throw error;
    }
  };



  export const getOnBoardRequests = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/onboard-requests`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch onboard requests');
    }
};

export const updateOnBoardRequestStatus = async (id, status) => {
    try {
        const response = await axios.post(`${BASE_URL}/onboard-requests/${id}/status`, { status });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to update status');
    }
};