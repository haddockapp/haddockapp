import { FC, useCallback, useMemo, useState } from "react";
import {
  useActivateUserMutation,
  useDeleteUserMutation,
  useDisableUserMutation,
  useGetSelfQuery,
  useLazyDownloadUserDataQuery,
  UserDto,
  UserRole,
} from "@/services/backendApi/users";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { generateColumns } from "./columns";
import { toast } from "@/hooks/use-toast";
import { downloadFile } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import useDisclosure from "@/hooks/use-disclosure";
import PasswordChangeForm from "@/components/organisms/PasswordChangeForm";
import { useDeleteInvitationMutation } from "@/services/backendApi/invitations";

type UsersTableProps = {
  users: UserDto[];
};

const UsersTable: FC<UsersTableProps> = ({ users }) => {
  const { data: connectedUser } = useGetSelfQuery();

  const [triggerActivate] = useActivateUserMutation();
  const [triggerDeactivate] = useDisableUserMutation();
  const [triggerDeleteUser] = useDeleteUserMutation();
  const [triggerDeleteInvitation] = useDeleteInvitationMutation();
  const [triggerDownload] = useLazyDownloadUserDataQuery();

  const {
    isOpen: isChangePasswordDialogOpen,
    onOpen: onOpenChangePasswordDialog,
    onClose: onCloseChangePasswordDialog,
  } = useDisclosure();
  const [userToChangePassword, setUserToChangePassword] = useState<
    string | null
  >(null);
  const onChangeOpenChangePaswordDialog = useCallback(
    (open: boolean, userId?: string) => {
      if (open) {
        setUserToChangePassword(userId!);
        onOpenChangePasswordDialog();
      } else {
        setUserToChangePassword(null);
        onCloseChangePasswordDialog();
      }
    },
    [onCloseChangePasswordDialog, onOpenChangePasswordDialog]
  );

  const columns = useMemo<ColumnDef<UserDto>[]>(() => {
    if (!connectedUser) return [];

    const result = generateColumns({
      connectedUser: connectedUser!,
      onResetPassword: (user: UserDto) =>
        onChangeOpenChangePaswordDialog(true, user.id),
      onActivate: (user: UserDto) =>
        triggerActivate(user.id)
          .unwrap()
          .catch(() => {
            toast({
              title: "User could not be activated",
              variant: "destructive",
            });
          }),
      onDeactivate: (user: UserDto) =>
        triggerDeactivate(user.id)
          .unwrap()
          .catch(() => {
            toast({
              title: "User could not be deactivated",
              variant: "destructive",
            });
          }),
      onDownloadPersonalData: (user: UserDto) =>
        triggerDownload(user.id)
          .unwrap()
          .then((res) =>
            downloadFile({
              data: JSON.stringify(res),
              fileName: `haddock-personal-data-${user.id}.json`,
              fileType: "text/json",
            })
          ),
      onDelete: (user: UserDto) =>
        user.role === UserRole.Invited
          ? triggerDeleteInvitation(user.id)
              .unwrap()
              .catch(() => {
                toast({
                  title: "Invitation could not be deleted",
                  variant: "destructive",
                });
              })
          : triggerDeleteUser(user.id)
              .unwrap()
              .catch(() => {
                toast({
                  title: "User could not be deleted",
                  variant: "destructive",
                });
              }),
    });
    return [
      result.ACTIONS,
      result.ACTIVE,
      result.NAME,
      result.EMAIL,
      result.ROLE,
    ];
  }, [
    connectedUser,
    onChangeOpenChangePaswordDialog,
    triggerActivate,
    triggerDeactivate,
    triggerDeleteUser,
    triggerDeleteInvitation,
    triggerDownload,
  ]);

  return (
    <>
      <Dialog
        open={isChangePasswordDialogOpen}
        onOpenChange={onChangeOpenChangePaswordDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Please enter the new password for the user
            </DialogDescription>
            <DialogClose />
          </DialogHeader>
          <PasswordChangeForm
            userId={userToChangePassword!}
            onSuccess={onCloseChangePasswordDialog}
          />
        </DialogContent>
      </Dialog>
      <DataTable columns={columns} data={users} />
    </>
  );
};

export default UsersTable;
