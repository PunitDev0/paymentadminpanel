import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Switch } from "@/components/ui/switch";
  
  const PermissionTable = ({ category, permissions, onToggle }) => {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{category}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((perm) => (
              <TableRow key={perm.service_id}>
                <TableCell>{perm.service_name}</TableCell>
                <TableCell>{perm.description}</TableCell>
                <TableCell>
                  <Switch
                    checked={perm.has_access}
                    onCheckedChange={() => onToggle(perm.service_id, perm.has_access)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  export default PermissionTable;