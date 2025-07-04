import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Main App Component
export default function App() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axios.get('/admin/bills');
        setBills(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bills');
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 text-red-600 text-lg font-semibold">
      {error}
    </div>
  );

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <Card className="w-full max-w-7xl mx-auto shadow-lg border border-gray-200 rounded-lg">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-3xl font-bold text-gray-800">Bill Management</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-100">
                <TableHead className="w-[100px] px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</TableHead>
                <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-700">CA Number</TableHead>
                <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Biller Name</TableHead>
                <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Consumer Name</TableHead>
                <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bill Amount</TableHead>
                <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bill Number</TableHead>
                <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bill Period</TableHead>
                <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bill Date</TableHead>
                <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</TableHead>
                <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Division</TableHead>
                <TableHead className="px-4 py-3 text-left text-sm font-semibold text-gray-700">LT/HT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">{bill.id}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700">{bill.ca_number}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700">{bill.biller_name}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700">{bill.consumer_name}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700">{bill.bill_amount}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700">{bill.bill_number}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700">{bill.bill_period}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700">{bill.bill_date}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700">{bill.due_date}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700">{bill.division}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700">{bill.lt_ht}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}