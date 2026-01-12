import { FC } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useInviteUserMutation } from "@/services/backendApi/invitations";
import { UserPlusIcon } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
});

type InviteUserFormProps = {
  onSuccess: () => void;
};

const InviteUserForm: FC<InviteUserFormProps> = ({ onSuccess }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const { control, handleSubmit } = form;

  const [triggerInviteUser] = useInviteUserMutation();

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    triggerInviteUser(data)
      .unwrap()
      .then(() => {
        form.reset();
        toast({
          title: "User invited successfully",
        });
        onSuccess();
      })
      .catch(() => {
        toast({
          title: "User could not be invited",
          variant: "destructive",
        });
      });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-between space-y-8"
      >
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="captain@haddock.ovh"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="shine" className="space-x-2" type="submit">
          <UserPlusIcon size={20} />
          <span>Send invitation</span>
        </Button>
      </form>
    </Form>
  );
};

export default InviteUserForm;
