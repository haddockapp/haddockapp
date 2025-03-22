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
      <span className="text-gray-800">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec
        purus ut sem malesuada tincidunt. Nullam nec purus ut sem malesuada
        tincidunt. Nullam nec purus ut sem malesuada tincidunt.
      </span>
      {connectedUser?.role === UserRole.Admin && (
        <SimpleDialog
          Content={() => <InviteUserForm onSuccess={onCloseInviteUserDialog} />}
          Trigger={({ onOpen }) => (
            <Button className="space-x-2 w-fit" onClick={onOpen}>
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
      <UsersTable users={data || []} />
    </div>
  );
};

export default UsersSettings;
