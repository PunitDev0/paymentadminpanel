import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PermissionTable from "./PermissionTable";
import { fetchUsers, fetchPermissions, updatePermissions } from "@/lib/apis";

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data.users);
        // Set the first user as the default selected user
        if (data.users.length > 0) {
          setSelectedUserId(data.users[0].id);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch users");
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Fetch permissions when the selected user changes
  useEffect(() => {
    if (!selectedUserId) return;

    const loadPermissions = async () => {
      setLoading(true);
      try {
        const data = await fetchPermissions(selectedUserId);
        setUser(data.user);
        setPermissions(data.permissions);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch permissions");
        setLoading(false);
      }
    };
    loadPermissions();
  }, [selectedUserId]);

  // Handle permission toggle
  const handleToggle = (serviceId, hasAccess) => {
    setPermissions((prev) =>
      prev.map((perm) =>
        perm.service_id === serviceId ? { ...perm, has_access: !hasAccess } : perm
      )
    );
  };

  // Save updated permissions
  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePermissions(selectedUserId, permissions);
      setLoading(false);
      alert("Permissions updated successfully!");
    } catch (err) {
      setError("Failed to update permissions");
      setLoading(false);
    }
  };

  // Reset to original permissions
  const handleCancel = () => {
    window.location.reload();
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = perm.category_name;
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin: Manage User Permissions</h1>

      {/* User selection dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User
        </label>
        <Select
          value={selectedUserId?.toString()}
          onValueChange={(value) => setSelectedUserId(parseInt(value))}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id.toString()}>
                {u.name} ({u.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {user && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            Permissions for {user.name}
          </h2>
          <p className="text-gray-600 mb-6">Email: {user.email}</p>

          {Object.keys(groupedPermissions).map((category) => (
            <PermissionTable
              key={category}
              category={category}
              permissions={groupedPermissions[category]}
              onToggle={handleToggle}
            />
          ))}

          <div className="flex justify-end space-x-4">
            <Button onClick={handleSave} disabled={loading}>
              Save Changes
            </Button>
            <Button variant="secondary" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;