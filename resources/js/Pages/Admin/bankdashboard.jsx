import React, { useEffect, useState } from 'react';
import { Search, X, Check, Ban, Eye, FileText } from 'lucide-react';
import { getAllBankDetails, activateBank, deactivateBank, getAllPaymentRequests, approvePaymentRequest, disapprovePaymentRequest } from '@/lib/apis';

export default function BankDashboard() {
  const [banks, setBanks] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState('inactive');
  const [selectedBank, setSelectedBank] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ show: false, bank: null, action: '' });
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBankData();
    fetchPendingRequests();
  }, []);

  const fetchBankData = async () => {
    setLoading(true);
    try {
      const data = await getAllBankDetails();
      if (Array.isArray(data)) {
        setBanks(data);
      } else {
        setBanks([]);
        console.warn('Fetched data is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const data = await getAllPaymentRequests();
      console.log('Pending Requests:', data);
      if (Array.isArray(data)) {
        setPendingRequests(data);
      } else {
        setPendingRequests([]);
        console.warn('Fetched payment requests data is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching payment requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (bankId) => {
    setLoading(true);
    try {
      await activateBank(bankId);
      fetchBankData();
      setSelectedBank(null);
    } catch (error) {
      console.error('Error activating bank:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (bankId) => {
    setLoading(true);
    try {
      await deactivateBank(bankId);
      fetchBankData();
    } catch (error) {
      console.error('Error deactivating bank:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    setLoading(true);
    try {
      await approvePaymentRequest(requestId);
      fetchPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisapproveRequest = async (requestId) => {
    setLoading(true);
    try {
      await disapprovePaymentRequest(requestId);
      fetchPendingRequests();
    } catch (error) {
      console.error('Error disapproving request:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBanks = Array.isArray(banks)
    ? banks.filter(bank => {
        const match = bank.bank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      bank.ifsc_code?.toLowerCase().includes(searchTerm.toLowerCase());
        return selectedTab === 'inactive' ? (bank.status === 0 && match) : (bank.status === 1 && match);
      })
    : [];

  const confirmAction = () => {
    if (confirmDialog.action === 'activate') {
      handleActivate(confirmDialog.bank.id);
    } else if (confirmDialog.action === 'deactivate') {
      handleDeactivate(confirmDialog.bank.id);
    }
    setConfirmDialog({ show: false, bank: null, action: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Bank Dashboard</h2>
          <button
            onClick={() => setShowPendingModal(true)}
            className="relative bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
            aria-label="View pending payment requests"
          >
            <FileText className="h-4 w-4 inline mr-1" /> Pending Requests
            {pendingRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 py-1 text-xs">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setSelectedTab('inactive')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedTab === 'inactive' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'} transition-colors duration-200`}
            aria-label="View inactive banks"
          >
            Inactive Banks
          </button>
          <button
            onClick={() => setSelectedTab('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedTab === 'active' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:bg-gray-50'} transition-colors duration-200`}
            aria-label="View active banks"
          >
            Active Banks
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Bank Name or IFSC"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              aria-label="Search banks"
            />
          </div>
        </div>

        {/* Bank Table */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{selectedTab === 'inactive' ? 'Inactive Banks' : 'Active Banks'}</h3>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Bank Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Account Holder</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Account Number</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">IFSC Code</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created At</th>
                    {selectedTab === 'active' && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Activated On</th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBanks.length > 0 ? (
                    filteredBanks.map((bank) => (
                      <tr key={bank.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bank.bank || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bank.account_name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bank.account_number || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bank.ifsc_code || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bank.username || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bank.created_at ? new Date(bank.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        {selectedTab === 'active' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {bank.updated_at ? new Date(bank.updated_at).toLocaleDateString() : 'N/A'}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {selectedTab === 'inactive' ? (
                            <button
                              className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
                              onClick={() => setSelectedBank(bank)}
                              disabled={loading}
                              aria-label={`View details for ${bank.bank}`}
                            >
                              <Eye className="h-4 w-4 inline mr-1" /> View Details
                            </button>
                          ) : (
                            <button
                              className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-300 transition-colors duration-200"
                              onClick={() => setConfirmDialog({ show: true, bank: bank, action: 'deactivate' })}
                              disabled={loading}
                              aria-label={`Deactivate ${bank.bank}`}
                            >
                              <Ban className="h-4 w-4 inline mr-1" /> Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={selectedTab === 'active' ? 8 : 7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No {selectedTab} banks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Requests Modal */}
        {showPendingModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Pending Payment Requests</h3>
                <button
                  onClick={() => setShowPendingModal(false)}
                  className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="Close pending requests modal"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : (
                <div className="overflow-x-auto max-h-[60vh]">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Transaction ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Deposited Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Bank</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Image</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingRequests.length > 0 ? (
                        pendingRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.transaction_type || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{parseFloat(request.amount || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.transaction_id || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {request.deposited_date ? new Date(request.deposited_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.bank ? request.bank.bank : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.user ? request.user.name : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {request.file_path ? (
                                <a
                                  href={request.file_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800"
                                  aria-label={`View image for request ${request.transaction_id}`}
                                >
                                  View
                                </a>
                              ) : (
                                'N/A'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.status || 'Pending'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <button
                                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-300 transition-colors duration-200 mr-2"
                                onClick={() => handleApproveRequest(request.id)}
                                disabled={loading}
                                aria-label={`Approve request ${request.transaction_id}`}
                              >
                                <Check className="h-4 w-4 inline mr-1" /> Approve
                              </button>
                              <button
                                className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-300 transition-colors duration-200"
                                onClick={() => handleDisapproveRequest(request.id)}
                                disabled={loading}
                                aria-label={`Disapprove request ${request.transaction_id}`}
                              >
                                <Ban className="h-4 w-4 inline mr-1" /> Disapprove
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                            No pending payment requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                  onClick={() => setShowPendingModal(false)}
                  aria-label="Close pending requests modal"
                >
                  <X className="h-4 w-4 inline mr-1" /> Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bank Details Modal */}
        {selectedBank && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Bank Details</h3>
                <button
                  onClick={() => setSelectedBank(null)}
                  className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="Close bank details modal"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-900"><strong>Bank Name:</strong> {selectedBank.bank || 'N/A'}</p>
                <p className="text-sm text-gray-900"><strong>Account Name:</strong> {selectedBank.account_name || 'N/A'}</p>
                <p className="text-sm text-gray-900"><strong>Account Number:</strong> {selectedBank.account_number || 'N/A'}</p>
                <p className="text-sm text-gray-900"><strong>IFSC Code:</strong> {selectedBank.ifsc_code || 'N/A'}</p>
                <p className="text-sm text-gray-900"><strong>Username:</strong> {selectedBank.username || 'N/A'}</p>
                <p className="text-sm text-gray-900"><strong>Created At:</strong> {selectedBank.created_at ? new Date(selectedBank.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
                  onClick={() => setConfirmDialog({ show: true, bank: selectedBank, action: 'activate' })}
                  disabled={loading}
                  aria-label={`Activate ${selectedBank.bank}`}
                >
                  <Check className="h-4 w-4 inline mr-1" /> Activate
                </button>
                <button
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                  onClick={() => setSelectedBank(null)}
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4 inline mr-1" /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmDialog.show && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Confirm Action</h3>
                <button
                  onClick={() => setConfirmDialog({ show: false, bank: null, action: '' })}
                  className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="Close confirmation dialog"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-900">
                Are you sure you want to{' '}
                <span className="font-bold">
                  {confirmDialog.action === 'activate' ? 'activate' : 'deactivate'}
                </span>{' '}
                the bank <span className="font-bold">{confirmDialog.bank.bank}</span>?
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
                  onClick={confirmAction}
                  disabled={loading}
                  aria-label="Confirm action"
                >
                  <Check className="h-4 w-4 inline mr-1" /> Yes
                </button>
                <button
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                  onClick={() => setConfirmDialog({ show: false, bank: null, action: '' })}
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4 inline mr-1" /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}