import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "recharts";
import { z } from "zod";
import { useCreateWorkspaceMutation } from "@/services/backendApi/workspaces";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2).max(24).nonempty(),
  description: z.string().max(255).optional(),
});

interface CreateWorkspaceFormProps {
  onClose?: () => void;
}
const CreateWorkspaceForm: FC<CreateWorkspaceFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [triggerCreateWorkspace] = useCreateWorkspaceMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
  });
  const { handleSubmit, reset, control } = form;

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    triggerCreateWorkspace({ name: data.name, description: data.description })
      .unwrap()
      .then((res) => {
        toast({ title: "Workspace created !", duration: 1000 });
        reset();
        onClose?.();
        navigate(`/workspaces/${res.id}/projects`);
      })
      .catch(() =>
        toast({
          title: "Error creating workspace",
          duration: 1000,
          variant: "destructive",
        })
      );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-between space-y-8"
      >
        <div className="flex flex-col justify-between space-y-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Label>Name</Label>
                <FormControl>
                  <Input placeholder="My Workspace" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <Label>Description</Label>
                <FormControl>
                  <Textarea
                    placeholder="This workspace is for ..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
};

export default CreateWorkspaceForm;
