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
  onResetPassword: (user: UserDto) => void;
  onActivate: (user: UserDto) => void;
  onDeactivate: (user: UserDto) => void;
  onDownloadPersonalData: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
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
                  connectedUser.role !== UserRole.Admin ||
                  row.original.role === UserRole.Invited
                }
                onClick={() => onActivate(row.original)}
                className="text-positive cursor-pointer"
              >
                <CircleCheckIcon />
                <span>Activate</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={
                  row.original.id === connectedUser.id ||
                  connectedUser.role !== UserRole.Admin ||
                  row.original.role === UserRole.Invited
                }
                onClick={() => onDeactivate(row.original)}
                className="text-destructive cursor-pointer"
              >
                <CircleMinusIcon />
                <span>Deactivate</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              disabled={
                connectedUser.role !== UserRole.Admin ||
                row.original.role === UserRole.Invited
              }
              className="cursor-pointer"
              onClick={() => onResetPassword(row.original)}
            >
              <KeyRoundIcon />
              <span>Reset password</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={row.original.role === UserRole.Invited}
              className="cursor-pointer"
              onClick={() => onDownloadPersonalData(row.original)}
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
              onClick={() => onDelete(row.original)}
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
    cell: ({ row }) =>
      row.original.role === UserRole.Invited ? null : (
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
