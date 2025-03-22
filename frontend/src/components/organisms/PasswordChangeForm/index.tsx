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
import { useChangeUserPasswordMutation } from "@/services/backendApi/users";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

type PasswordChangeFormProps = {
  userId: string;
  onSuccess: () => void;
};

const PasswordChangeForm: FC<PasswordChangeFormProps> = ({
  userId,
  onSuccess,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const { control, handleSubmit } = form;

  const [triggerChangePassword] = useChangeUserPasswordMutation();

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    triggerChangePassword({ id: userId, ...data })
      .unwrap()
      .then(() => {
        form.reset();
        toast({
          title: "Password changed successfully",
        });
        onSuccess();
      })
      .catch(() => {
        toast({
          title: "Password could not be changed",
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Change password</Button>
      </form>
    </Form>
  );
};

export default PasswordChangeForm;
