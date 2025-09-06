import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useCreateProjectTokenMutation } from "@/services/backendApi/projects";
import { TokenPermission, CreateProjectTokenDto } from "@/services/backendApi/projects/projects.dto";
import CopiableField from "@/components/molecules/copiable-field";

interface CreateTokenDialogProps {
  projectId: string;
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

export default function CreateTokenDialog({ projectId }: CreateTokenDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<TokenPermission[]>([TokenPermission.READ]);
  const [expiresAt, setExpiresAt] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const { toast } = useToast();

  const [createToken, { isLoading }] = useCreateProjectTokenMutation();

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

    const createData: CreateProjectTokenDto = {
      name: name.trim(),
      permissions,
      ...(expiresAt && { expiresAt }),
    };

    try {
      const result = await createToken({ projectId, body: createData }).unwrap();
      setCreatedToken(result.token || null);
      setName("");
      setPermissions([]);
      setExpiresAt("");
      
      toast({
        title: "Token created",
        description: "Your project token has been created successfully. Make sure to copy it now as it won't be shown again.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error creating token",
        description: "An error occurred while creating the token.",
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

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setCreatedToken(null);
      setName("");
      setPermissions([TokenPermission.READ]);
      setExpiresAt("");
    }
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button>Create Token</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {createdToken ? "Token Created" : "Create Project Token"}
          </DialogTitle>
          <DialogDescription>
            {createdToken 
              ? "Your token has been created. Copy it now as it won't be shown again."
              : "Create a new token for CLI access to this project."
            }
          </DialogDescription>
        </DialogHeader>

        {createdToken ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="token">Your new token:</Label>
              <div className="w-full max-w-full overflow-hidden">
                <CopiableField value={createdToken} />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Make sure to copy your token now. You won't be able to see it again!
              </p>
            </div>
          </div>
        ) : (
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
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Token"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {createdToken && (
          <DialogFooter>
            <Button onClick={closeDialog}>Done</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
