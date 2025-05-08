import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const WhitelistedIpsManager = ({whitelistedIps}) => {
    const [ips, setIps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIps();
    }, []);

    const fetchIps = async () => {
        try {
            setIps(whitelistedIps);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching IPs:', error);
            setLoading(false)
        }
    };

    const toggleStatus = async (id) => {
        try {
            const response = await axios.patch(`/admin/whitelisted-ips/${id}/toggle-status`);
            setIps(ips.map(ip => 
                ip.id === id ? { ...ip, status: response.data.status } : ip
            ));
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Whitelisted IPs Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>User ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Updated At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ips.map((ip) => (
                                <TableRow key={ip.id}>
                                    <TableCell>{ip.id}</TableCell>
                                    <TableCell>{ip.ip_address}</TableCell>
                                    <TableCell>{ip.user_id || 'N/A'}</TableCell>
                                    <TableCell>{ip.status ? 'Active' : 'Inactive'}</TableCell>
                                    <TableCell>{new Date(ip.created_at).toLocaleString()}</TableCell>
                                    <TableCell>{new Date(ip.updated_at).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={() => toggleStatus(ip.id)}
                                            variant={ip.status ? "destructive" : "default"}
                                        >
                                            {ip.status ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default WhitelistedIpsManager;