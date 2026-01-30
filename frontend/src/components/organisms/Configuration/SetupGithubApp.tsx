import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useConfiguration from "@/hooks/use-configuration";
import { toast } from "@/hooks/use-toast";
import {
  useCreateConfigurationMutation,
  useGetConfigurationQuery,
} from "@/services/backendApi/configuration";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  clientId: z.string().length(20),
  clientSecret: z.string().length(40),
});

export type ConfigurationProps = {
  onClose?: () => void;
};

const Configuration: FC<ConfigurationProps> = ({ onClose }) => {
  const [triggerCreateConfiguration] = useCreateConfigurationMutation();
  const { data: configurationData } = useGetConfigurationQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleCreateConfiguration = useCallback(
    (data: z.infer<typeof formSchema>) => {
      triggerCreateConfiguration({
        client_id: data.clientId,
        client_secret: data.clientSecret,
      })
        .unwrap()
        .then(() => {
          toast({
            title: "Configuration updated successfully",
          });
          onClose?.();
        })
        .catch(() => {
          toast({
            title: "Configuration could not be created",
            variant: "destructive",
          });
        });
    },
    [onClose, triggerCreateConfiguration]
  );

  const { githubConfig } = useConfiguration();

  useEffect(() => {
    if (githubConfig) {
      if (githubConfig.clientId)
        form.setValue("clientId", githubConfig.clientId);
      // if (githubConfig.clientSecret)
      //   form.setValue("clientSecret", githubConfig.clientSecret);
    }
  }, [form, githubConfig]);

  const onSubmit = form.handleSubmit(handleCreateConfiguration);

  const isGithubAppConfirmed = useMemo(
    () => configurationData?.find((c) => c.key === "github_client_id"),
    [configurationData]
  );

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8 text-start">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Github Client ID</FormLabel>
                <FormControl>
                  <Input placeholder="0v20GH9zccjbTmUJO2Kf" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientSecret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Github Client Secret</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="3p2m7wgbqmo4th8dj12v3p2m7wgbqmo4th8dj12v"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button variant="shine" type="submit">
          {!isGithubAppConfirmed ? "Update" : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default Configuration;
