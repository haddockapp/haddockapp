import { FC, useCallback, useEffect, useState } from "react";
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
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import {
  useGetSSOConfigurationQuery,
  useUpdateSSOConfigurationMutation,
  usePatchSSOConfigurationMutation,
  useToggleSSOEnabledMutation,
  useTestSSOConfigurationMutation,
} from "@/services/backendApi/sso";
import type { SSOConfigurationInputDto } from "@/services/backendApi/sso/sso.dto";

const CERT_PLACEHOLDER = `-----BEGIN CERTIFICATE-----
MIIEowIBAAK...jLV05UD
-----END CERTIFICATE-----`;

const urlOrEmptySchema = z
  .string()
  .refine(
    (val) => {
      if (!val || val.trim().length === 0) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Must be a valid URL" }
  )
  .optional();

const formSchema = z
  .object({
    enabled: z.boolean(),
    entryPoint: urlOrEmptySchema,
    issuer: urlOrEmptySchema,
    callbackUrl: urlOrEmptySchema,
    cert: z
      .string()
      .refine(
        (val) => {
          if (!val || val.length === 0) return true;
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
  .superRefine((data, ctx) => {
    if (data.enabled) {
      if (!data.entryPoint || data.entryPoint.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Entrypoint is required when SSO is enabled",
          path: ["entryPoint"],
        });
      }
      if (!data.issuer || data.issuer.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Issuer is required when SSO is enabled",
          path: ["issuer"],
        });
      }
      if (!data.callbackUrl || data.callbackUrl.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Callback URL is required when SSO is enabled",
          path: ["callbackUrl"],
        });
      }
    }
  });

type SSOFormData = z.infer<typeof formSchema>;

const SSO: FC = () => {
  const { data: ssoConfig, isLoading } = useGetSSOConfigurationQuery();
  const [updateSSOConfiguration, { isLoading: isSubmitting }] =
    useUpdateSSOConfigurationMutation();
  const [patchSSOConfiguration, { isLoading: isPatching }] =
    usePatchSSOConfigurationMutation();
  const [toggleSSOEnabled, { isLoading: isToggling }] =
    useToggleSSOEnabledMutation();
  const [testSSOConfiguration, { isLoading: isTesting }] =
    useTestSSOConfigurationMutation();
  const [isUpdatingCert, setIsUpdatingCert] = useState(false);

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
  const isCertConfigured = ssoConfig?.cert === true;
  const isSubmittingOrPatching = isSubmitting || isPatching;

  useEffect(() => {
    if (ssoConfig) {
      form.reset(
        {
          enabled: ssoConfig.enabled ?? false,
          entryPoint: ssoConfig.entryPoint || "",
          issuer: ssoConfig.issuer || "",
          callbackUrl: ssoConfig.callbackUrl || "",
          cert: "",
        },
        {
          keepErrors: false,
          keepDirty: false,
          keepIsSubmitted: false,
          keepTouched: false,
          keepIsValid: false,
          keepSubmitCount: false,
        }
      );
      setIsUpdatingCert(false);
    }
  }, [ssoConfig, form]);

  const handleSubmit = useCallback(
    async (data: SSOFormData) => {
      if (isCertConfigured && !isUpdatingCert && data.enabled) {
        form.clearErrors("cert");
        const entryPointValid = await form.trigger("entryPoint");
        const issuerValid = await form.trigger("issuer");
        const callbackUrlValid = await form.trigger("callbackUrl");

        const otherFieldsValid =
          entryPointValid &&
          issuerValid &&
          callbackUrlValid &&
          data.entryPoint &&
          data.entryPoint.trim().length > 0 &&
          data.issuer &&
          data.issuer.trim().length > 0 &&
          data.callbackUrl &&
          data.callbackUrl.trim().length > 0;

        if (!otherFieldsValid) {
          return;
        }
      } else {
        const isValid = await form.trigger();
        if (!isValid) {
          return;
        }
        if (
          !isCertConfigured &&
          data.enabled &&
          (!data.cert || data.cert.trim().length === 0)
        ) {
          form.setError("cert", {
            type: "manual",
            message: "Certificate is required when SSO is enabled",
          });
          return;
        }
      }

      try {
        const payload: SSOConfigurationInputDto = {
          enabled: data.enabled,
          entryPoint: data.entryPoint || "",
          issuer: data.issuer || "",
          callbackUrl: data.callbackUrl || "",
        };

        if (data.cert && data.cert.trim().length > 0) {
          payload.cert = data.cert;
        }

        if (isCertConfigured) {
          await patchSSOConfiguration(payload).unwrap();
        } else {
          await updateSSOConfiguration(payload).unwrap();
        }

        form.clearErrors();

        toast({
          title: "SSO configuration updated successfully",
          duration: 2000,
          variant: "default",
        });
        if (isUpdatingCert) {
          setIsUpdatingCert(false);
        }
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
    [
      updateSSOConfiguration,
      patchSSOConfiguration,
      isCertConfigured,
      isUpdatingCert,
      form,
    ]
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

    if (!ssoConfig) {
      toast({
        title: "SSO not configured",
        description: "Please configure SSO settings before testing.",
        duration: 2000,
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await testSSOConfiguration().unwrap();
      const messages: string[] = [];
      if (result.errors.length > 0) {
        messages.push(`Errors: ${result.errors.join(", ")}`);
      }
      if (result.warnings.length > 0) {
        messages.push(`Warnings: ${result.warnings.join(", ")}`);
      }
      const description = messages.length > 0 ? messages.join("\n") : undefined;

      toast({
        title: result.valid
          ? "SSO configuration test successful"
          : "SSO configuration test failed",
        description: description,
        duration: 3000,
        variant: result.valid ? "default" : "destructive",
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
  }, [form, testSSOConfiguration, ssoConfig]);

  const handleToggleEnabled = useCallback(
    async (enabled: boolean) => {
      try {
        await toggleSSOEnabled({ enabled }).unwrap();
        form.setValue("enabled", enabled);
        toast({
          title: enabled
            ? "SSO enabled successfully"
            : "SSO disabled successfully",
          duration: 2000,
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Failed to toggle SSO",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          duration: 3000,
          variant: "destructive",
        });
        form.setValue("enabled", !enabled);
      }
    },
    [toggleSSOEnabled, form]
  );

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
                    onCheckedChange={handleToggleEnabled}
                    disabled={isSubmittingOrPatching || isToggling}
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
                    disabled={isSubmittingOrPatching || !isEnabled}
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
                    disabled={isSubmittingOrPatching || !isEnabled}
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
                    disabled={isSubmittingOrPatching || !isEnabled}
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
                {isCertConfigured && !isUpdatingCert ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-input bg-muted/50 p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-typography">
                              Certificate is configured
                            </p>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <p className="text-sm text-typography/60">
                            A certificate has been set for SSO authentication.
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsUpdatingCert(true)}
                        disabled={isSubmittingOrPatching || !isEnabled}
                        className="flex-shrink-0"
                      >
                        Update Certificate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={CERT_PLACEHOLDER}
                        className="min-h-32 font-mono text-sm"
                        disabled={isSubmittingOrPatching || !isEnabled}
                      />
                    </FormControl>
                    <FormDescription>
                      The PEM-encoded certificate used to verify SSO responses.
                      This should be the public certificate from your SSO
                      provider.
                    </FormDescription>
                    {isCertConfigured && isUpdatingCert && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsUpdatingCert(false);
                          form.setValue("cert", "");
                        }}
                        disabled={isSubmittingOrPatching}
                        className="mt-2"
                      >
                        Cancel
                      </Button>
                    )}
                    <FormMessage />
                  </>
                )}
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={isSubmittingOrPatching || isTesting || !isEnabled}
            >
              {isTesting ? "Testing..." : "Test Configuration"}
            </Button>
            <Button type="submit" disabled={isSubmittingOrPatching}>
              {isSubmittingOrPatching ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SSO;
