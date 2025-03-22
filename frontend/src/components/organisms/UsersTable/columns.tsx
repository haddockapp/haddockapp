import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserDto, UserRole } from "@/services/backendApi/users";
import { ColumnDef } from "@tanstack/react-table";
import {
  CircleCheckIcon,
  CircleMinusIcon,
  DownloadIcon,
  KeyRoundIcon,
  MoreVerticalIcon,
  TrashIcon,
} from "lucide-react";

enum ColumnName {
  ACTIONS = "ACTIONS",
  NAME = "NAME",
  EMAIL = "EMAIL",
  ROLE = "ROLE",
  ACTIVE = "ACTIVE",
}

type GenerateColumnsProps = {
  connectedUser: UserDto;
  onResetPassword: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDownloadPersonalData: (id: string) => void;
  onDelete: (id: string) => void;
};

export const generateColumns = ({
  connectedUser,
  onResetPassword,
  onActivate,
  onDeactivate,
  onDownloadPersonalData,
  onDelete,
}: GenerateColumnsProps): Record<ColumnName, ColumnDef<UserDto>> => ({
  ACTIONS: {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="justify-end text-primary" asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-primary">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!row.original.isActive ? (
              <DropdownMenuItem
                disabled={
                  row.original.id === connectedUser.id ||
                  connectedUser.role !== UserRole.Admin
                }
                onClick={() => onActivate(row.original.id)}
                className="text-positive cursor-pointer"
              >
                <CircleCheckIcon />
                <span>Activate</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={
                  row.original.id === connectedUser.id ||
                  connectedUser.role !== UserRole.Admin
                }
                onClick={() => onDeactivate(row.original.id)}
                className="text-destructive cursor-pointer"
              >
                <CircleMinusIcon />
                <span>Deactivate</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              disabled={connectedUser.role !== UserRole.Admin}
              className="cursor-pointer"
              onClick={() => onResetPassword(row.original.id)}
            >
              <KeyRoundIcon />
              <span>Reset password</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onDownloadPersonalData(row.original.id)}
            >
              <DownloadIcon />
              <span>Download personal data</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={
                row.original.id === connectedUser.id ||
                connectedUser.role !== UserRole.Admin
              }
              onClick={() => onDelete(row.original.id)}
              className="text-destructive cursor-pointer"
            >
              <TrashIcon />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  NAME: {
    accessorKey: "name",
    header: "Username",
  },
  EMAIL: {
    accessorKey: "email",
    header: "Email",
  },
  ROLE: {
    accessorKey: "role",
    header: "Role",
  },
  ACTIVE: {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (
      <div>
        {row.getValue("isActive") ? (
          <CircleCheckIcon className="text-positive" />
        ) : (
          <CircleMinusIcon className="text-destructive" />
        )}
      </div>
    ),
  },
});
