import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  DomainResponseDto,
  useCreateDomainMutation,
} from "@/services/backendApi/domains";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  domain: z.string().regex(/^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,8}$/, {
    message: "Invalid domain name",
  }),
});

interface DomainNameFormProps {
  domain?: DomainResponseDto;
  main?: boolean;
}
const DomainNameForm: FC<DomainNameFormProps> = ({ domain, main }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: domain?.domain || "",
    },
  });

  const [triggerCreateDomain] = useCreateDomainMutation();

  const onSubmit = form.handleSubmit((data) => {
    triggerCreateDomain({ domain: data.domain, main: main ?? false })
      .unwrap()
      .then(() => {
        toast({ title: "Domain created successfully" });
        form.reset();
      })
      .catch((e) => {
        toast({ title: "Error", description: JSON.stringify(e) });
      });
  });

  return (
    <Form {...form}>
      <form className="text-start" onSubmit={onSubmit}>
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input {...field} placeholder="Domain name" />
                </FormControl>
                <FormDescription className="italic">
                  eg: example.com, domain.fr...
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Confirm</Button>
        </div>
      </form>
    </Form>
  );
};

export default DomainNameForm;
