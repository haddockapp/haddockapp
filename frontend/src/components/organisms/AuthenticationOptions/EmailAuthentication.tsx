import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/hooks/useStore";
import { setToken } from "@/services/authSlice";
import {
  useSignInMutation,
  useSignUpMutation,
} from "@/services/backendApi/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { FC, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(3).optional(),
});

const EmailAuthentication: FC = () => {
  const navigate = useNavigate();

  const [type, setType] = useState<"log-in" | "sign-up">("log-in");

  const dispatch = useAppDispatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [triggerSignUp] = useSignUpMutation();
  const [triggerLogin] = useSignInMutation();

  const handleSubmit = useCallback(
    (payload: z.infer<typeof formSchema>) => {
      if (payload.name === undefined && type === "sign-up") {
        form.setError("name", {
          type: "manual",
          message: "Name is required",
        });
      }

      (type === "log-in"
        ? triggerLogin({
            email: payload.email,
            password: payload.password,
          })
        : triggerSignUp({
            email: payload.email,
            password: payload.password,
            name: payload.name!,
          })
      )
        .unwrap()
        .then(({ accessToken }) => {
          dispatch(setToken(accessToken));
          navigate("/loading");
        })
        .catch((e) =>
          toast({
            title: "Sign up failed",
            description: e.error.message,
            variant: "destructive",
          })
        );
    },
    [dispatch, form, navigate, triggerLogin, triggerSignUp, type]
  );

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <div>
          <div className="flex space-x-2 justify-center select-none">
            <Mail />
            <span>{type === "sign-up" ? "Sign-up" : "Log-in"} with e-mail</span>
          </div>
          <Button
            variant="link"
            type="button"
            onClick={() => setType(type !== "log-in" ? "log-in" : "sign-up")}
          >
            <span>or {type !== "log-in" ? "log-in" : "sign-up"} instead</span>
          </Button>
        </div>
        <div className="space-y-4 text-start">
          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="User Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="user@haddock.ovh" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="****************"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button variant="outline" type="submit">
          <span>{type === "log-in" ? "Login" : "Signup"}</span>
        </Button>
      </form>
    </Form>
  );
};

export default EmailAuthentication;
