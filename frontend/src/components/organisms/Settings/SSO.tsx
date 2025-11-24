import { FC, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  useGetSSOConfigurationQuery,
  useUpdateSSOConfigurationMutation,
  useTestSSOConfigurationMutation,
} from "@/services/backendApi/sso";

const CERT_PLACEHOLDER = `-----BEGIN CERTIFICATE-----
MIIEowIBAAK...jLV05UD
-----END CERTIFICATE-----`;

const formSchema = z
  .object({
    enabled: z.boolean(),
    entryPoint: z.string().url("Entrypoint must be a valid URL").optional(),
    issuer: z.string().url("Issuer must be a valid URL").optional(),
    callbackUrl: z.string().url("Callback URL must be a valid URL").optional(),
    cert: z
      .string()
      .refine(
        (val) => {
          if (!val || val.length === 0) return true; // Allow empty when disabled
          return /^-----BEGIN CERTIFICATE-----([^-!]+)-----END CERTIFICATE-----/s.test(
            val
          );
        },
        {
          message:
            "Invalid certificate format. Must be a valid PEM certificate.",
        }
      )
      .optional(),
  })
  .refine(
    (data) => {
      // If enabled, all fields are required and must be non-empty
      if (data.enabled) {
        return (
          data.entryPoint !== undefined &&
          data.entryPoint.length > 0 &&
          data.issuer !== undefined &&
          data.issuer.length > 0 &&
          data.callbackUrl !== undefined &&
          data.callbackUrl.length > 0 &&
          data.cert !== undefined &&
          data.cert.length > 0
        );
      }
      return true;
    },
    {
      message: "All fields are required when SSO is enabled",
      path: ["entryPoint"],
    }
  );

type SSOFormData = z.infer<typeof formSchema>;

const SSO: FC = () => {
  const { data: ssoConfig, isLoading } = useGetSSOConfigurationQuery();
  const [updateSSOConfiguration, { isLoading: isSubmitting }] =
    useUpdateSSOConfigurationMutation();
  const [testSSOConfiguration, { isLoading: isTesting }] =
    useTestSSOConfigurationMutation();

  const form = useForm<SSOFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enabled: false,
      entryPoint: "",
      issuer: "",
      callbackUrl: "",
      cert: "",
    },
  });

  const isEnabled = form.watch("enabled");

  useEffect(() => {
    if (ssoConfig) {
      form.reset({
        enabled: ssoConfig.enabled ?? false,
        entryPoint: ssoConfig.entryPoint,
        issuer: ssoConfig.issuer,
        callbackUrl: ssoConfig.callbackUrl,
        cert: ssoConfig.cert,
      });
    }
  }, [ssoConfig, form]);

  const handleSubmit = useCallback(
    async (data: SSOFormData) => {
      try {
        await updateSSOConfiguration({
          enabled: data.enabled,
          entryPoint: data.entryPoint || "",
          issuer: data.issuer || "",
          callbackUrl: data.callbackUrl || "",
          cert: data.cert || "",
        }).unwrap();
        toast({
          title: "SSO configuration updated successfully",
          duration: 2000,
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Failed to update SSO configuration",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          duration: 3000,
          variant: "destructive",
        });
      }
    },
    [updateSSOConfiguration]
  );

  const handleTest = useCallback(async () => {
    const formData = form.getValues();
    if (!formData.enabled) {
      toast({
        title: "SSO is not enabled",
        description: "Please enable SSO before testing the configuration.",
        duration: 2000,
        variant: "destructive",
      });
      return;
    }

    // Validate form before testing
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Invalid configuration",
        description: "Please fix the form errors before testing.",
        duration: 2000,
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await testSSOConfiguration().unwrap();
      toast({
        title: result.success
          ? "SSO configuration test successful"
          : "SSO configuration test failed",
        description: result.message,
        duration: 3000,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Failed to test SSO configuration",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        duration: 3000,
        variant: "destructive",
      });
    }
  }, [form, testSSOConfiguration]);

  const onSubmit = form.handleSubmit(handleSubmit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-typography/50">Loading SSO configuration...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <p className="text-typography/80">
        Configure Single Sign-On (SSO) settings for your application. Provide
        the entrypoint URL, issuer URL, callback URL, and the certificate for
        SSO authentication.
      </p>
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col space-y-6">
          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable SSO</FormLabel>
                  <FormDescription>
                    Activate Single Sign-On (SAML) authentication. When enabled,
                    a "Login with SSO" button will appear on the login page.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="entryPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entrypoint</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="url"
                    placeholder="https://sso.example.com/sso/login"
                    disabled={isSubmitting || !isEnabled}
                  />
                </FormControl>
                <FormDescription>
                  The SSO entrypoint URL where users will be redirected for
                  authentication.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issuer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issuer</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="url"
                    placeholder="https://sso.example.com"
                    disabled={isSubmitting || !isEnabled}
                  />
                </FormControl>
                <FormDescription>
                  The issuer URL that identifies the SSO identity provider.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="callbackUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Callback URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="url"
                    placeholder="https://your-app.com/auth/callback"
                    disabled={isSubmitting || !isEnabled}
                  />
                </FormControl>
                <FormDescription>
                  The callback URL where the SSO provider will redirect users
                  after authentication.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cert"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificate</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={CERT_PLACEHOLDER}
                    className="min-h-32 font-mono text-sm"
                    disabled={isSubmitting || !isEnabled}
                  />
                </FormControl>
                <FormDescription>
                  The PEM-encoded certificate used to verify SSO responses. This
                  should be the public certificate from your SSO provider.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={isSubmitting || isTesting || !isEnabled}
            >
              {isTesting ? "Testing..." : "Test Configuration"}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SSO;
