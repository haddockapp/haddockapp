import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProjectTokenMutation } from "@/services/backendApi/projects";
import { TokenPermission, UpdateProjectTokenDto, ProjectTokenDto } from "@/services/backendApi/projects/projects.dto";

interface EditTokenDialogProps {
  projectId: string;
  token: ProjectTokenDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

const PERMISSION_LABELS: Record<TokenPermission, { label: string; description: string }> = {
  [TokenPermission.READ]: {
    label: "Read",
    description: "View project information, services, and environment variables"
  },
  [TokenPermission.START]: {
    label: "Start",
    description: "Start the project"
  },
  [TokenPermission.STOP]: {
    label: "Stop", 
    description: "Stop the project"
  },
  [TokenPermission.DEPLOY]: {
    label: "Deploy",
    description: "Deploy/pull latest changes for the project"
  },
  [TokenPermission.RECREATE]: {
    label: "Recreate",
    description: "Recreate the project"
  },
  [TokenPermission.MANAGE_SERVICES]: {
    label: "Manage Services",
    description: "Start, stop, and restart individual services"
  },
  [TokenPermission.MANAGE_ENVIRONMENT]: {
    label: "Manage Environment",
    description: "Create, update, and delete environment variables"
  },
};

export default function EditTokenDialog({ 
  projectId, 
  token, 
  open, 
  onOpenChange, 
  onClose 
}: EditTokenDialogProps) {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<TokenPermission[]>([]);
  const [expiresAt, setExpiresAt] = useState("");
  const { toast } = useToast();

  const [updateToken, { isLoading }] = useUpdateProjectTokenMutation();

  useEffect(() => {
    if (token) {
      setName(token.name);
      setPermissions(token.permissions);
      setExpiresAt(token.expiresAt ? new Date(token.expiresAt).toISOString().slice(0, 16) : "");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Token name is required",
        variant: "destructive",
      });
      return;
    }

    if (permissions.length === 0) {
      toast({
        title: "Error", 
        description: "At least one permission is required",
        variant: "destructive",
      });
      return;
    }

    const updateData: UpdateProjectTokenDto = {
      name: name.trim(),
      permissions,
      ...(expiresAt && { expiresAt }),
    };

    try {
      await updateToken({ projectId, tokenId: token.id, body: updateData }).unwrap();
      
      toast({
        title: "Token updated",
        description: "The token has been updated successfully.",
        variant: "default",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error updating token",
        description: "An error occurred while updating the token.",
        variant: "destructive",
      });
    }
  };

  const handlePermissionChange = (permission: TokenPermission, checked: boolean) => {
    setPermissions(prev => 
      checked 
        ? [...prev, permission]
        : prev.filter(p => p !== permission)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Token</DialogTitle>
          <DialogDescription>
            Update the token's name, permissions, and expiration date.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Token Name</Label>
            <Input
              id="name"
              placeholder="e.g., Production CLI"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="space-y-3">
              {Object.entries(PERMISSION_LABELS).map(([permission, { label, description }]) => (
                <div key={permission} className="flex items-start space-x-3">
                  <Checkbox
                    id={permission}
                    checked={permissions.includes(permission as TokenPermission)}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission as TokenPermission, checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={permission}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no expiration
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Token"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
