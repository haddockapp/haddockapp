import { FC, useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Authorizations from "./Authorizations";
import ChangeGithubApplication from "./ChangeGithubApplication";
import UsersSettings from "./Users";
import About from "./About";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/authSlice";
import { LogOutIcon } from "lucide-react";
import { useAppDispatch } from "@/hooks/useStore";
import { useNavigate } from "react-router-dom";
import useSetup from "@/hooks/use-setup";
import SSO from "./SSO";
import { useGetSelfQuery, UserRole } from "@/services/backendApi/users";
import Kbd from "@/components/atoms/kbd";
import { useSidebar } from "@/components/ui/sidebar";
import { formatShortcut } from "@/lib/utils";

const settings: {
  key: string;
  name: string;
  command: string;
  Component: FC<{ onClose: () => void }>;
  isAuthRequired: boolean;
  isAdminRequired?: boolean;
}[] = [
    {
      key: "users",
      name: "Users",
      command: "U",
      Component: UsersSettings,
      isAuthRequired: true,
    },
    {
      key: "github-application",
      name: "GitHub Application",
      command: "G",
      Component: ChangeGithubApplication,
      isAuthRequired: false,
    },
    {
      key: "authorizations",
      name: "Authorizations",
      command: "A",
      Component: Authorizations,
      isAuthRequired: true,
    },
    {
      key: "sso",
      name: "SSO Configuration",
      Component: SSO,
      command: "L",
      isAuthRequired: true,
      isAdminRequired: true,
    },
    {
      key: "about",
      name: "About",
      command: "Z",
      Component: About,
      isAuthRequired: false,
    },
  ];

const keyToMenu: Record<string, string> = {
  U: "users",
  G: "github-application",
  A: "authorizations",
  L: "sso",
  Z: "about",
};

const Settings: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [accordionOpen, setAccordionOpen] = useState<string[]>([]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { setOpen: setOpenSidebar } = useSidebar();

  const { isSetupComplete } = useSetup();
  const { data: connectedUser } = useGetSelfQuery();

  const isAdmin = connectedUser?.role === UserRole.Admin;

  const filteredSettings = (
    isSetupComplete ? settings : settings.filter((s) => !s.isAuthRequired)
  ).filter((s) => !s.isAdminRequired || isAdmin);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        Object.keys(keyToMenu).includes(e.key.toUpperCase())
      ) {
        e.preventDefault();
        setOpenSidebar(true);
        setAccordionOpen([keyToMenu[e.key.toUpperCase()]]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setOpenSidebar]);

  return (
    <div className="space-y-4 h-full justify-between flex flex-col overflow-x-auto">
      <Accordion type="multiple" value={accordionOpen}>
        {filteredSettings.map(({ key, name, command, Component }) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger
              onClick={() =>
                setAccordionOpen((pV) =>
                  pV.includes(key) ? pV.filter((v) => v !== key) : [...pV, key]
                )
              }
              className="text-xl"
            >
              <div className="flex flex-row gap-4">
                <Kbd>{formatShortcut(`⌘ + Shift + ${command}`)}</Kbd>
                {name}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Component
                onClose={() =>
                  setAccordionOpen((pV) => pV.filter((v) => v !== key))
                }
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {isSetupComplete && (
        <div className="flex justify-end p-4">
          <Button
            onClick={() => {
              navigate("/");
              dispatch(logout());
              onClose();
            }}
            variant="dark"
            className="space-x-2"
          >
            <LogOutIcon size={20} />
            <span>Logout</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Settings;
