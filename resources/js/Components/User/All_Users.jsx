import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { deleteUser, fetchUsers, updateUser } from "@/lib/apis";
import { Skeleton } from "@/components/ui/skeleton";
import { ExclamationTriangleIcon, CubeIcon } from "@radix-ui/react-icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FaUser, FaEnvelope, FaLock, FaUserCog, FaSearch } from "react-icons/fa";

export default function AllUsers({ setActiveSection, setUserData }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [roles] = useState(['admin', 'user']);
  const [searchTerm, setSearchTerm] = useState('');

  // Form setup with validation
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      role: "",
      password: "",
    },
    mode: "onChange",
  });

  // Fetch users
  useEffect(() => {
    let mounted = true;

    const getUsers = async () => {
      try {
        const usersData = await fetchUsers();
        if (mounted) {
          setUsers(usersData?.users || []);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to fetch users");
          setIsLoading(false);
        }
      }
    };

    getUsers();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle edit and delete actions
  const handleAction = (action, user) => {
    if (action === "edit") {
      setSelectedUser(user);
      form.reset({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        password: "",
      });
      setIsEditDialogOpen(true);
    } else if (action === "delete") {
      setSelectedUser(user);
      setIsDialogOpen(true);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      toast.success("User deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete user. Try again!");
      console.error("Delete error:", error);
    } finally {
      setIsDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // Toggle user status
  const toggleUserActiveStatus = async (user) => {
    try {
      const updatedUser = {
        ...user,
        status: user.status === 1 ? 0 : 1,
      };
      const response = await updateUser(user.id, updatedUser);
      setUsers(users.map(u => u.id === user.id ? response.user : u));
      toast.success(`User ${updatedUser.status === 1 ? "activated" : "deactivated"} successfully!`);
    } catch (error) {
      toast.error("Failed to update user status. Try again!");
      console.error("Error updating user status:", error);
    }
  };

  // Handle edit form submission
  const onEditSubmit = async (values) => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const updateData = { ...values };
      if (!updateData.password) {
        delete updateData.password;
      }
      const response = await updateUser(selectedUser.id, updateData);
      setUsers(users.map(u => u.id === selectedUser.id ? response.user : u));
      toast.success("User updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      form.reset();
    } catch (error) {
      toast.error(error.message || "Failed to update user");
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="p-6 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2 text-indigo-800">
          <CubeIcon className="h-8 w-8 text-indigo-600" /> All Users
        </h2>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 max-w-lg border p-2 mt-4 mx-4 rounded-md bg-white shadow-sm">
          <FaSearch className="text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            className="border-none focus:ring-0"
          />
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => setActiveSection("add-user")}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            Add New
          </Button>
        </div>
      </div>

      <Card className="w-full shadow-lg rounded-xl bg-white overflow-hidden">
        <CardContent className="p-5">
          <div className="p-6">
            {error ? (
              <Alert variant="destructive" className="mb-6 bg-red-100 border border-red-400">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">Error: {error}</AlertDescription>
              </Alert>
            ) : isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg bg-gray-200" />
                ))}
              </div>
            ) : (
              <div className="border rounded-lg overflow-auto shadow-lg">
                <Table className="w-full min-w-[600px]">
                  <TableHeader className="bg-indigo-100">
                    <TableRow>
                      <TableHead className="text-center text-indigo-800">ID</TableHead>
                      <TableHead className="text-center text-indigo-800">Name</TableHead>
                      <TableHead className="text-center text-indigo-800">Email</TableHead>
                      <TableHead className="text-center text-indigo-800">Role</TableHead>
                      <TableHead className="text-center text-indigo-800">Created At</TableHead>
                      <TableHead className="text-center text-indigo-800">Status</TableHead>
                      <TableHead className="text-center text-indigo-800">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-indigo-50 border-t">
                          <TableCell className="text-center py-4">{user.id}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-indigo-600">
                              {user.name || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{user.email || 'N/A'}</TableCell>
                          <TableCell className="text-center font-mono text-gray-600">{user.role || 'N/A'}</TableCell>
                          <TableCell className="text-center text-sm text-gray-500">
                            {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={user.status === 1}
                              onCheckedChange={() => toggleUserActiveStatus(user)}
                              className={`${user.status === "1" ? "bg-green-600" : "bg-red-600"} rounded-full`}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Select onValueChange={(value) => handleAction(value, user)}>
                              <SelectTrigger className="w-24 border rounded-md bg-indigo-50 text-indigo-700 mx-auto">
                                <SelectValue placeholder="Actions" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="edit">Edit</SelectItem>
                                <SelectItem value="delete">Delete</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="7" className="h-24 text-center text-gray-500">
                          <CubeIcon className="h-8 w-8 text-gray-400 mx-auto" />
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete the user {selectedUser?.name || 'this user'}?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false);
              setSelectedUser(null);
            }}>
              Cancel
            </Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setSelectedUser(null);
          form.reset();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormLabel className="flex items-center text-gray-600">
                      <FaUser className="mr-2 text-blue-500" /> Name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormLabel className="flex items-center text-gray-600">
                      <FaEnvelope className="mr-2 text-blue-500" /> Email
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormLabel className="flex items-center text-gray-600">
                      <FaUserCog className="mr-2 text-blue-500" /> Role
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role, index) => (
                          <SelectItem key={index} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                rules={{
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                }}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormLabel className="flex items-center text-gray-600">
                      <FaLock className="mr-2 text-blue-500" /> Password
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Enter new password (optional)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUser(null);
                  form.reset();
                }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#7C3AED] hover:bg-[#6D28D9]"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}