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
import { Button } from "@/components/ui/button";
import { logout } from "@/services/authSlice";
import { LogOutIcon } from "lucide-react";
import { useAppDispatch } from "@/hooks/useStore";
import { useNavigate } from "react-router-dom";
import useSetup from "@/hooks/use-setup";

const settings: {
  key: string;
  name: string;
  Component: FC<{ onClose: () => void }>;
  isAuthRequired: boolean;
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
];

const Settings: FC = () => {
  const [accordionOpen, setAccordionOpen] = useState<string[]>([]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isSetupComplete } = useSetup();

  return (
    <div className="space-y-4 h-full justify-between flex flex-col">
      <Accordion type="multiple" value={accordionOpen}>
        {(isSetupComplete
          ? settings
          : settings.filter((s) => !s.isAuthRequired)
        ).map(({ key, name, Component }) => (
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
