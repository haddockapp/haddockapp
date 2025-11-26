import { FC, useState } from "react";
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

const settings: {
  key: string;
  name: string;
  Component: FC<{ onClose: () => void }>;
  isAuthRequired: boolean;
  isAdminRequired?: boolean;
}[] = [
  {
    key: "users",
    name: "Users",
    Component: UsersSettings,
    isAuthRequired: true,
  },
  {
    key: "github-application",
    name: "GitHub Application",
    Component: ChangeGithubApplication,
    isAuthRequired: false,
  },
  {
    key: "authorizations",
    name: "Authorizations",
    Component: Authorizations,
    isAuthRequired: true,
  },
  {
    key: "sso",
    name: "Single Sign-On (SSO) Configuration",
    Component: SSO,
    isAuthRequired: true,
    isAdminRequired: true,
  },
  {
    key: "about",
    name: "About",
    Component: About,
    isAuthRequired: false,
  },
];

const Settings: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [accordionOpen, setAccordionOpen] = useState<string[]>([]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isSetupComplete } = useSetup();
  const { data: connectedUser } = useGetSelfQuery();

  const isAdmin = connectedUser?.role === UserRole.Admin;

  const filteredSettings = (
    isSetupComplete ? settings : settings.filter((s) => !s.isAuthRequired)
  ).filter((s) => !s.isAdminRequired || isAdmin);

  return (
    <div className="space-y-4 h-full justify-between flex flex-col overflow-x-auto">
      <Accordion type="multiple" value={accordionOpen}>
        {filteredSettings.map(({ key, name, Component }) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger
              onClick={() =>
                setAccordionOpen((pV) =>
                  pV.includes(key) ? pV.filter((v) => v !== key) : [...pV, key]
                )
              }
              className="text-xl"
            >
              {name}
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
