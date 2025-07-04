import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

// Error Boundary Component
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex justify-center items-center h-64">
                    <p className="text-lg text-red-500">
                        Something went wrong: {this.state.error?.message || "Unknown error"}
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}

const ApiLogs = () => {
    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        api_name: "",
        user_id: "",
        id: "",
    });

    const fetchLogs = async (page = 1, filterParams = {}) => {
        setLoading(true);
        try {
            const response = await axios.get("/admin/api-logs", {
                params: { page, per_page: pagination.per_page, ...filterParams },
            });
            if (response.data.success) {
                setRecords(response.data.data);
                setPagination(response.data.pagination);
                setError(null);
            } else {
                setError("Failed to fetch records");
            }
        } catch (err) {
            setError("Failed to fetch records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1, filters); // Initial fetch with filters
    }, [filters]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchLogs(newPage, filters);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    // Filter out empty or falsy values for status and api_name
    const uniqueApiNames = [...new Set(records.map((record) => record.api_name))].filter(
        (api) => api && api.trim() !== ""
    );
    const uniqueStatuses = ["success", "failed"]

    return (
        <ErrorBoundary>
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
                    API Logs Dashboard
                </h1>

                {/* Filter Section */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center flex-wrap">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            placeholder="Search by Request ID or Reference ID..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                            className="pl-10 py-2 bg-white border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-4 flex-wrap">
                        <div className="relative w-[120px]">
                            <Input
                                placeholder="Filter ID"
                                value={filters.id}
                                onChange={(e) => handleFilterChange("id", e.target.value)}
                                className="py-2 bg-white border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="relative w-[120px]">
                            <Input
                                placeholder="Filter User ID"
                                value={filters.user_id}
                                onChange={(e) => handleFilterChange("user_id", e.target.value)}
                                className="py-2 bg-white border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <Select
                            value={filters.status}
                            onValueChange={(value) =>
                                handleFilterChange("status", value === "all" ? null : value)
                            }
                        >
                            <SelectTrigger className="w-[150px] bg-white border-gray-200">
                                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {uniqueStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                       
                    </div>
                </div>

                {/* Loading and Error States */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-lg text-gray-500 animate-pulse">Loading...</p>
                    </div>
                )}
                {error && (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-lg text-red-500">{error}</p>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && (
                    <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-100">
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">ID</TableHead>
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">User ID</TableHead>
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">API Name</TableHead>
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">Request ID</TableHead>
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">Reference ID</TableHead>
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">Request Payload</TableHead>
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">Response Data</TableHead>
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">Status</TableHead>
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">Error Message</TableHead>
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">IP Address</TableHead>
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">Execution Time</TableHead>
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">Created At</TableHead>
                                    <TableHead className="text-xs sm:text-sm font-semibold text-gray-700">Updated At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map((record) => (
                                    <TableRow key={record.id} className="hover:bg-gray-50">
                                        <TableCell className="text-xs sm:text-sm">{record.id}</TableCell>
                                        <TableCell className="text-xs sm:text-sm">{record.user_id || "-"}</TableCell>
                                        <TableCell className="text-xs sm:text-sm">{record.api_name}</TableCell>
                                        <TableCell className="text-xs sm:text-sm">{record.request_id}</TableCell>
                                        <TableCell className="text-xs sm:text-sm">{record.reference_id}</TableCell>
                                        <TableCell className="max-w-[150px] sm:max-w-[200px] truncate break-all text-xs sm:text-sm">
                                            {record.request_payload}
                                        </TableCell>
                                        <TableCell className="max-w-[150px] sm:max-w-[200px] truncate break-all text-xs sm:text-sm">
                                            {record.response_data}
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm">{record.status}</TableCell>
                                        <TableCell className="text-xs sm:text-sm">{record.error_message || "-"}</TableCell>
                                        <TableCell className="text-xs sm:text-sm">{record.ip_address || "-"}</TableCell>
                                        <TableCell className="text-xs sm:text-sm">{record.execution_time || "-"}</TableCell>
                                        <TableCell className="text-xs sm:text-sm">{record.created_at}</TableCell>
                                        <TableCell className="text-xs sm:text-sm">{record.updated_at}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && (
                    <Pagination className="mt-6 justify-center">
                        <PaginationContent>
                            <PaginationItem>
                                <Button
                                    variant="outline"
                                    className="border-gray-200 hover:bg-indigo-50"
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                >
                                    <PaginationPrevious />
                                </Button>
                            </PaginationItem>
                            <PaginationItem>
                                <span className="text-sm px-4 py-2 text-gray-600">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>
                            </PaginationItem>
                            <PaginationItem>
                                <Button
                                    variant="outline"
                                    className="border-gray-200 hover:bg-indigo-50"
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                >
                                    <PaginationNext />
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default ApiLogs;