import {
  useGetAllUsersQuery,
  useGetSelfQuery,
  UserRole,
} from "@/services/backendApi/users";
import { FC } from "react";
import UsersTable from "../UsersTable";
import { Button } from "@/components/ui/button";
import { MailPlusIcon } from "lucide-react";
import useDisclosure from "@/hooks/use-disclosure";
import SimpleDialog from "@/components/organisms/SimpleDialog";
import InviteUserForm from "@/components/organisms/InviteUserForm";

const UsersSettings: FC = () => {
  const { data: connectedUser } = useGetSelfQuery();
  const { data } = useGetAllUsersQuery();

  const {
    isOpen: isInviteUserDialogOpen,
    onOpen: onOpenInviteUserDialog,
    onClose: onCloseInviteUserDialog,
  } = useDisclosure();

  return (
    <div className="flex flex-col space-y-4">
      <span className="text-typography/80">
        Below is the list of users that have access to the platform, with their
        informations and roles. You can manage current users or invite new ones.
      </span>
      <UsersTable users={data || []} />
      <div className="flex items-center space-x-2 justify-end">
        {connectedUser?.role === UserRole.Admin && (
          <SimpleDialog
            Content={() => (
              <InviteUserForm onSuccess={onCloseInviteUserDialog} />
            )}
            Trigger={({ onOpen }) => (
              <Button variant="shine" className="space-x-2" onClick={onOpen}>
                <MailPlusIcon size={20} />
                <span>Invite User</span>
              </Button>
            )}
            description="Invite a new user to the platform"
            title="Invite User"
            isOpen={isInviteUserDialogOpen}
            onClose={onCloseInviteUserDialog}
            onOpen={onOpenInviteUserDialog}
          />
        )}
      </div>
    </div>
  );
};

export default UsersSettings;
