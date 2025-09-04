import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  useGetProjectTokensQuery,
  useDeleteProjectTokenMutation,
  useUpdateProjectTokenMutation,
} from "@/services/backendApi/projects";
import { ProjectTokenDto, TokenPermission } from "@/services/backendApi/projects/projects.dto";
import { formatDistanceToNow } from "date-fns";
import { Trash2, MoreHorizontal, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditTokenDialog from "./EditTokenDialog";

interface TokensListProps {
  projectId: string;
}

const PERMISSION_LABELS: Record<TokenPermission, string> = {
  [TokenPermission.READ]: "Read",
  [TokenPermission.START]: "Start",
  [TokenPermission.STOP]: "Stop", 
  [TokenPermission.DEPLOY]: "Deploy",
  [TokenPermission.RECREATE]: "Recreate",
  [TokenPermission.MANAGE_SERVICES]: "Services",
  [TokenPermission.MANAGE_ENVIRONMENT]: "Environment",
};

export default function TokensList({ projectId }: TokensListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<ProjectTokenDto | null>(null);
  const { toast } = useToast();

  const { data: tokens = [], isLoading } = useGetProjectTokensQuery(projectId);
  const [deleteToken] = useDeleteProjectTokenMutation();
  const [updateToken] = useUpdateProjectTokenMutation();

  const handleDeleteToken = async () => {
    if (!selectedToken) return;

    try {
      await deleteToken({ projectId, tokenId: selectedToken.id }).unwrap();
      toast({
        title: "Token deleted",
        description: "The token has been deleted successfully.",
        variant: "default",
      });
      setDeleteDialogOpen(false);
      setSelectedToken(null);
    } catch (error) {
      toast({
        title: "Error deleting token",
        description: "An error occurred while deleting the token.",
        variant: "destructive",
      });
    }
  };

  const handleToggleTokenStatus = async (token: ProjectTokenDto) => {
    try {
      await updateToken({
        projectId,
        tokenId: token.id,
        body: { isActive: !token.isActive },
      }).unwrap();
      
      toast({
        title: token.isActive ? "Token disabled" : "Token enabled",
        description: `The token has been ${token.isActive ? "disabled" : "enabled"} successfully.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error updating token",
        description: "An error occurred while updating the token.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const isExpired = (expiresAt: string | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading tokens...</div>;
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tokens created yet.</p>
        <p className="text-sm">Create your first token to get started with CLI access.</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell className="font-medium">{token.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {token.permissions.slice(0, 3).map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {PERMISSION_LABELS[permission]}
                      </Badge>
                    ))}
                    {token.permissions.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{token.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      !token.isActive 
                        ? "destructive"
                        : isExpired(token.expiresAt)
                        ? "destructive" 
                        : "default"
                    }
                  >
                    {!token.isActive 
                      ? "Disabled"
                      : isExpired(token.expiresAt)
                      ? "Expired"
                      : "Active"
                    }
                  </Badge>
                </TableCell>
                <TableCell>
                  {token.lastUsedAt ? formatDate(token.lastUsedAt) : "Never"}
                </TableCell>
                <TableCell>
                  {token.expiresAt ? formatDate(token.expiresAt) : "Never"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedToken(token);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleTokenStatus(token)}
                      >
                        {token.isActive ? "Disable" : "Enable"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedToken(token);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Token</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the token "{selectedToken?.name}"? 
              This action cannot be undone and any applications using this token will lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteToken}>
              Delete Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Token Dialog */}
      {selectedToken && (
        <EditTokenDialog
          projectId={projectId}
          token={selectedToken}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedToken(null);
          }}
        />
      )}
    </>
  );
}
