import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FaUser, FaEnvelope, FaLock, FaPlus, FaUserCog, FaSync } from "react-icons/fa";
import { addUsers, getUserRoles, storeUserRole, updateUser } from "@/lib/apis";
import { toast } from "react-toastify";

export default function Create_User({ id }) {
  const [isLoading, setIsLoading] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [roles, setRoles] = useState(['admin','user']);
  const [userData, setUserData] = useState(null);
  console.log(roles);
  
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      role: "",
      password: "",
    },
  });

  // Fetch user data if `id` is provided (for updating)
  useEffect(() => {
    if (id) {
      const fetchUserData = async () => {
        try {
          const user = await updateUser(id); // Assuming this fetches user data
          setUserData(user);
          form.reset({
            name: user.name || "",
            email: user.email || "",
            role: user.role || "",
            password: "", // Password is initially empty for updates
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to fetch user data");
        }
      };
      fetchUserData();
    }
  }, [id, form]);

  // Improved password generation function
  const generatePassword = (name) => {
    if (!name) return "";
    const randomString = Math.random().toString(36).slice(-4); // 4 random alphanumeric chars
    const randomNumbers = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    return `${name.replace(/\s+/g, "").toLowerCase()}@${randomString}${randomNumbers}`;
  };

  const handleNameChange = (event) => {
    const name = event.target.value;
    form.setValue("name", name);
    if (!id) { // Only auto-generate password for new users
      form.setValue("password", generatePassword(name));
    }
  };

  const regeneratePassword = () => {
    const name = form.getValues("name");
    form.setValue("password", generatePassword(name));
  };

//   const fetchRoles = async () => {
//     try {
//       const response = await getUserRoles();
//       setRoles(response || []);
//     } catch (error) {
//       console.error("Error fetching roles:", error);
//     }
//   };

//   useEffect(() => {
//     fetchRoles();
//   }, []);

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      if (id) {
        // Update existing user
        const updateData = { ...values };
        if (!updateData.password) {
          delete updateData.password; // Exclude password if not provided
        }
        const response = await updateUser(id, updateData);
        console.log("Updated user data:", response);
        toast.success("User updated successfully");
      } else {
        // Create a new user
        const response = await addUsers(values);
        console.log("Created new user:", response);
        toast.success("User added successfully");
      }
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(`Error: ${error.response?.data?.message || "Failed to process request"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (newRole.trim()) {
      try {
        await storeUserRole(newRole);
        toast.success("Role added successfully");
        setNewRole("");
        // fetchRoles(); // Refresh roles
      } catch (error) {
        console.error("Error adding role:", error);
        toast.error("Failed to add role");
      }
    }
  };

  return (
    <div className="h-[90vh] flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {id ? "Update User" : "Add New User"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormLabel className="flex items-center text-gray-600">
                      <FaUser className="mr-2 text-blue-500" /> Name
                    </FormLabel>
                    <FormControl>
                      <Input {...field} onChange={handleNameChange} placeholder="Enter name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
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

              {/* Role Field */}
              {userData && (
                <FormItem className="flex items-center space-x-3">
                  <FormLabel className="flex items-center text-gray-600">
                    <FaUserCog className="mr-2 text-blue-500" /> Current Role
                  </FormLabel>
                  <FormControl>
                    <Input readOnly value={userData.role} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              <FormField
                control={form.control}
                name="role"
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
                        {roles.map((role,index) => (
                          <SelectItem key={index} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormLabel className="flex items-center text-gray-600">
                      <FaLock className="mr-2 text-blue-500" /> Password
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          {...field}
                          placeholder={id ? "Enter new password (optional)" : "Generated password"}
                        />
                        <Button type="button" onClick={regeneratePassword} className="bg-gray-500 hover:bg-gray-600">
                          <FaSync className="mr-2" /> Regenerate
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buttons Section */}
              <div className="flex justify-end space-x-4">
                {/* Add Role Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-500 hover:bg-green-600 flex items-center">
                      <FaPlus className="mr-2" /> Add Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Role</DialogTitle>
                    </DialogHeader>
                    <div className="p-4">
                      <Input
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Enter new role"
                      />
                      <DialogFooter className="mt-4">
                        <Button onClick={handleAddRole} className="bg-green-500 hover:bg-green-600">
                          <FaPlus className="mr-2" /> Add Role
                        </Button>
                        <Button variant="outline" onClick={() => setNewRole("")}>
                          Cancel
                        </Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Submit Button */}
                <Button type="submit" className="bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <FaUser className="animate-spin mr-2" /> {id ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <FaUser className="mr-2" /> {id ? "Update User" : "Add User"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}