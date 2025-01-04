import type { Meta, StoryObj } from "@storybook/react";
import SettingsTab from "@/components/organisms/ProjectTabs/SettingsTab";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { ProjectDto } from "@/services/backendApi/projects/projects.dto";
import { VmState, VmProvider } from "@/types/vm/vm";

const meta = {
  title: "Organisms/SettingsTab",
  component: SettingsTab,
  parameters: {
    layout: "centered",
    msw: {
      handlers: [
        http.delete("/api/projects/:projectId", () => {
          return new HttpResponse(null, { status: 200 });
        }),
        http.get("/api/projects", () => {
          return HttpResponse.json([mockProject]);
        }),
        http.patch("/api/projects/:projectId", () => {
          return new HttpResponse(null, { status: 200 });
        }),
      ],
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={["/project/project-123"]}>
          <Routes>
            <Route
              path="/project/:projectId"
              element={
                <div className="w-[800px]">
                  <Story />
                </div>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    ),
  ],
} satisfies Meta<typeof SettingsTab>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockProject: ProjectDto = {
  id: "project-123",
  name: "Demo Project",
  description: "A sample project for Storybook demonstration",
  sourceId: "source-123",
  vmId: "vm-123",
  source: {
    id: "source-123",
    type: "github",
    authorizationId: "auth-123",
    settings: {
      branch: "main",
      repository: "demo-repo",
      organization: "demo-org",
    },
  },
  vm: {
    id: "vm-123",
    status: VmState.Running,
    ip: "192.168.1.100",
    memory: 4096,
    disk: 50,
    cpus: 2,
    provider: VmProvider.Libvirt,
    createdAt: new Date("2024-03-20"),
  },
};

export const Default: Story = {};
