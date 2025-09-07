# Acceptance Test Plan – Haddock

---

## 1. Introduction

### Haddock in a Nutshell

Haddock is a **self-hosted Platform-as-a-Service (PaaS)** designed to make app deployment effortless **and secure by default**.  
It interprets your existing **compose.yml** and automates the rest—virtual machines, DNS, networking, monitoring, and lifecycle management.  
Unlike heavy orchestrators or cloud-locked PaaS solutions, Haddock combines **developer simplicity** with **VM-level security**.

---

### Who We Built It For

- **Freelancers & Indie Devs** – Deploy client projects quickly, with built-in isolation and safe defaults.
- **Agencies & Startups** – Run multiple apps securely, each in its own VM and domain.
- **SMEs & Enterprises** – Host internal apps or intranets on-premises with controlled access.
- **Public Sector IT Teams** – Meet compliance requirements with self-hosting and robust security practices.
- **No-Code / Low-Code Users** – Launch WordPress or catalog apps without setup, safely sandboxed.
- **Developers & Teams** – Ensure consistent, secure environments from dev to production.

---

### The Pain We’re Solving

Modern app deployment is often:

- **Complex** – Multiple config files, CI/CD pipelines, and orchestration layers.
- **Fragile** – DNS and reverse proxies manually configured, prone to errors.
- **Risky** – Weak defaults, no isolation, or costly reliance on external providers.
- **Unsafe** – No security by default, no isolation, no control over the infrastructure.

Haddock removes these barriers with a **secure-by-design PaaS** where developers can focus on **building, not firefighting infrastructure**.

---

### How Haddock Works Behind the Scenes

- **One-Line Installer** – Sets up Haddock on UNIX systems with all dependencies.
- **Smart Onboarding** – GitHub OAuth or email login, automated DNS binding.
- **Seamless Deployment** – Just point to your repo and compose.yml.
- **Total Control** – Start, stop, restart, update, or delete projects instantly.
- **Granular Service Management** – Networks, ports, environment variables (with support for **secrets**), and resource limits.
- **Live Insights** – Real-time CPU, RAM, disk metrics, and service logs.
- **Plug-and-Play Networking** – Automatic reverse proxy, domains, subdomains, HTTPS.
- **Security Practices Built-In** – Haddock analyzes projects for **container best practices** (exposed ports, resource limits, env vars) and highlights misconfigurations.

---

### Why Haddock Stands Out

- **Compose.yml is Enough** – If your app is dockerized, it runs. No extra YAMLs, no custom DSLs.
- **VM-Powered Security** – Each project is fully sandboxed in its own VM with hardened networking, reducing attack surface compared to container-only PaaS.
- **Self-Hostable & Open Source** – Full ownership of infrastructure and data, no vendor lock-in.
- **Secure by Default** – Embedded checks on deployment configs help enforce **good security hygiene** automatically.
- **Made for Developers** – A clean, real-time dashboard instead of endless CLI scripts.
- **Ecosystem-Ready** – 100% OCI-compliant, works with any container image.

---

## 2. Scope

The scope of this Acceptance Test Plan covers all major and minor functionalities of Haddock, organized by priority and relevance. Each category defines what will be tested, why it matters, and what the acceptance criteria should validate.

---

### 2.1 Critical Features

These are **core functionalities** that must work flawlessly for the platform to be usable. Without them, Haddock cannot fulfill its purpose as a PaaS solution.

- **Installation & Onboarding**  
  Validation of the automated installer, initial setup steps (GitHub application, email authentication, DNS configuration). These are the foundations of the system and must be robust and repeatable.

- **Authentication Methods**  
  Support for multiple methods (OAuth, Personal Access Tokens, Deploy Keys). Ensures developers can securely connect their GitHub repositories and maintain flexibility.

- **Project Deployment**  
  Ability to select repositories, branches, and configure VM resources. These are the most critical operations that determine how quickly and reliably projects are deployed.

- **Project Lifecycle Management**  
  Functions such as start, stop, restart, recreate, update, and delete must work consistently to guarantee operational stability.

- **Service Management**  
  Granular control over individual services (start, stop, restart, monitoring, environment variables) is vital for debugging, scaling, and ensuring uptime.

---

### 2.2 Secondary Functions

These features add value but are not strictly essential for the platform to function. They improve usability, governance, and administration.

- **User Invitations and Account Lifecycle**  
  Allow administrators to onboard users easily, deactivate/reactivate accounts, reset passwords, or remove users when needed.

- **Editing GitHub App Configuration**  
  Ability to update OAuth credentials post-setup. Important for maintenance and operational flexibility.

- **Editing Project Information**  
  Supports renaming and updating descriptions for better organization, especially in multi-project environments.

- **Downloading User Data**  
  Compliance-oriented feature that ensures GDPR and data portability requirements.

- **User Topology Preferences**  
  Allows developers to personalize the project’s visual topology. Improves ergonomics but is not mission-critical.

---

### 2.3 User Interface

These tests validate the **ergonomics, navigation, and accessibility** of the platform. The goal is to ensure Haddock is intuitive and developer-friendly.

- **Topology View with ReactFlow**  
  A visual representation of services and dependencies, ensuring clarity and accuracy of system architecture.

- **Dashboard Overview**  
  High-level view of all projects with statuses, ensuring users can immediately understand their deployments’ state.

- **Service Detail Drawers**  
  Contextual side panels with details on service status, configuration, and networking. Must be responsive and easy to navigate.

- **Interactive Network Binding & Redirection Interface**  
  Visual tools to configure ports, subdomains, and domain bindings without editing configs manually.

- **Monitoring UI**  
  Charts and logs that update in real-time, enabling developers to debug and monitor performance effectively.

---

### 2.4 Compatibility

These tests ensure Haddock works consistently across different environments and user contexts.

- **Operating System Compatibility**  
  Verified on **Debian 12 with Vagrant provider** as reference environment. Future tests may extend to other UNIX-based systems.

- **Browser Compatibility**  
  Platform must function across major browsers (Chrome, Firefox, Safari, Edge).

- **Responsiveness & Accessibility**  
  UI must adapt to different screen sizes and follow accessibility best practices to support all users.

---

## 3. Test Plan

This section details all the test scenarios required to validate Haddock’s features.
Each scenario includes: description, objective, prerequisites, steps, and expected result.

### 3.1. Test Scenarios

⚠️ **IMPORTANT!** ⚠️

**If you are testing Haddock on the `demo.haddock.ovh` environment, _all required information and credentials are provided in the appendices zip files_.**

**You will find:**

- ✅ A valid GitHub deploy key

**_Do not proceed without reviewing these files!_**  
They contain everything you need to successfully test the application and we highly recommend to use them to avoid any mistakes.

#### Scenario 1: Application installation

> **Note:**  
> If you are testing on the `demo.haddock.ovh` environment, you can skip scenarios 1–4 and proceed directly to **Scenario 5**. The demo environment is already pre-installed, pre-configured, and ready for use.

- **Objective:** To verify the successful installation of the Haddock application on a Debian 12 machine using Vagrant as the provider.
- **Prerequisites:**

  - A Debian 12 machine is set up and running.
  - The system administrator has access to the terminal with appropriate permissions.

- **Steps:**

  1. Open the terminal on the Debian 12 machine.
  2. Run the installation command provided in the Haddock documentation.
  3. When prompted, select yes for installing "vagrant" as the provider for the installation.
  4. Monitor the installation process and wait until it completes successfully.

- **Expected result:**
  - The installer should exit automatically upon completion.
  - The installer should display all installation steps with checkmarks indicating successful completion of each step.
  - The installer should output a URL for accessing the installed Haddock application.

---

#### Scenario 2: Onboarding: Register via email

- **Objective:** Verify that a system administrator can successfully register via email and be redirected to the "Domain names" page.
- **Prerequisites:**
  - The application is up and running.
  - The system administrator has access to the signup page.
- **Steps:**
  1. Open the onboarding signup page.
  2. Enter a valid user name in the "Name" input field.
  3. Enter a valid email address in the "E-mail" input field.
  4. Enter a valid password in the "Password" input field.
  5. Click on the "Signup" button.
- **Expected result:**
  - The system administrator should be successfully registered.
  - The system should redirect the administrator to the "Domain names" page within the application.

---

#### Scenario 3: Onboarding: Setup primary domain

- **Objective:** To test the functionality of setting up a primary domain during the onboarding process.
- **Prerequisites:**

  - The system administrator should have access to the onboarding platform.
  - The system administrator must own and have control over a valid domain name.
  - The system administrator should have access to their domain provider's interface for DNS configuration.

- **Steps:**

  1.  Open the onboarding onboarding Domain names page.
  2.  Select the "Setup main domain" section.
  3.  In the "Domain name" input, write an owned valid domain name and click on the "Confirm" button.
  4.  Note down the three generated DNS Bind inputs (primary, wildcard, challenge).
  5.  Use these DNS Bind inputs to set up the domain on the provider's interface.
  6.  Click on the "Refresh" button to check the progression of the setup. The checkmark should update according to the configuration on the provider's interface.
  7.  Repeat step 6 until all steps are marked by a checkmark.
  8.  Once all steps are completed, the "Next" button should be enabled.
  9.  Click on the "Save" button to save the primary domain name.

- **Expected result:**
  - After confirming the domain at the first step, 3 bind values (primary, wildcard, challenge) must be generated.
  - The checkmark should update on refresh button click, according to the configuration on the provider's interface.
  - The "Next" button must be disabled until all steps are completed.
  - The "Save" button must allow you to setup a second domain name after the first one is saved.
  - No error messages or unexpected behavior should occur during the test.

#### Scenario 4: Onboarding: Setup secondary domain

- **Objective:** To verify the functionality of setting up a secondary domain in the onboarding process.
- **Prerequisites:**

  - The system administrator should have access to the onboarding platform.
  - The system administrator must have already set up a primary domain.
  - The system administrator must own and have control over a valid domain name (different than the domain used as Primary Domain).
  - The system administrator should have access to their domain provider's interface for DNS configuration.

- **Steps:**

  1.  Still on the onboarding onboarding "Domain names" page.
  2.  Locate and click the "Setup secondary domain" section.
  3.  Enter a new, unique domain name in the "Domain name" field that differs from the primary domain and click on the "Confirm" button.
  4.  Note down the three generated DNS Bind inputs (primary, wildcard, challenge).
  5.  Use these DNS Bind inputs to set up the domain on the provider's interface.
  6.  Click on the "Refresh" button to check the progression of the setup. The checkmark should update according to the configuration on the provider's interface.
  7.  Repeat step 6 until all steps are marked by a checkmark (note that this time, Primary Bind is optional).
  8.  Click on the "Save" button to save the primary domain name.

- **Expected result:**
  - After confirming the domain at the first step, 3 bind values (primary, wildcard, challenge) must be generated.
  - The checkmark should update on refresh button click, according to the configuration on the provider's interface.
  - No error messages or unexpected behavior should occur during the test.

---

#### Scenario 5: Deploying a project from a public repository without an authorization method

- **Objective:** Test deploying a public repository without any authorization method setup
- **Prerequisites:**
  - The user is logged in to their developer account.
  - The dashboard page is open.
- **Steps:**
  1.  Click on the "Deploy a project" button on the top-right corner of the page.
  2.  Select the "N/A" authorization method.
  3.  Fill in your desired public Github repository name.  
      _If you are testing on the `demo.haddock.ovh` environment, you can use the `haddockapp/demo_public` repository._
  4.  Fill in your desired branch to deploy from.  
      _If you are testing on the `demo.haddock.ovh` environment, you can use the `main` branch._
  5.  Enter your Docker Compose file's path inside the repository.  
      _If you are testing on the `demo.haddock.ovh` environment, you can use the `compose.yml` file._
  6.  Move to the next step.
  7.  Use the sliders to set your desired allocations for CPUs, Memory and Disk.  
      _If you are testing on the `demo.haddock.ovh` environment, you can use the `2` for CPUs, `2048` for Memory and `512` for Disk._
  8.  Press the "Create" button
- **Expected result:**
  - You'll be redirected to the project details page.
  - The project's status should become in "Running" state.
  - If you back to the dashboard, you should see the new project card in the list.

---

#### Scenario 6: Adding a new authorization method - Deploy Key

> **Note:**  
> If you are testing on the `demo.haddock.ovh` environment, we provided you a valid deploy key in the appendices zip files.

- **Objective:** Test the functionality of adding a new Deploy Key authorization in the application.
- **Prerequisites:**
  - The user is logged in to their developer account.
- **Steps:**
  1. Open the settings drawer by clicking on the purple stack icon at the top-right corner of the screen.
  2. Unfold the "Authorizations" menu.
  3. Press the "Add authorization" button to initiate the creation process for a new authorization method.
  4. Fill in the desired label for the new authorization method.
  5. Select the "Deploy Key" radio button.
  6. Fill in your desired deploy key in the text area.  
     _If you are testing on the `demo.haddock.ovh` environment, use the deploy key provided in the appendices zip files._
  7. Press the "Confirm" button to complete the flow.
- **Expected result:**
  - A toast message appears at the bottom of the screen to inform the user that the new authorization has been created successfully.
  - The newly added authorization is displayed in the "Authorizations" table within the previous sub-menu inside the settings drawer.
  - The new authorization method also becomes available within the "Deploy a project" modal, allowing users to choose it for their projects.

---

#### Scenario 7: Setting the github application configuration from the settings drawer

> **Note:**  
> If you are testing on the `demo.haddock.ovh` environment, you can skip scenarios 7-9 and proceed directly to **Scenario 10**. The github application configuration is already set up.

- **Objective:** Test the functionality of setting the GitHub application configuration from the settings drawer.
- **Prerequisites:**
  - The system administrator did not set the GitHub application configuration yet.
  - The administrator is logged in to the application.
  - A valid GitHub client ID and secret exist.
- **Steps:**
  1. Open the settings drawer by clicking on the purple stack icon at the top-right corner of the screen.
  2. Unfold the "GitHub Application" sub-menu.
  3. Navigate to the GitHub website and create a new GitHub application by filling out the required fields (e.g., application name, homepage url, callback URL provided by Haddock).
  4. Obtain the required credentials (e.g., client ID and client secret) from the GitHub application configuration.
  5. Fill in the "Github Client ID" and "Github Client Secret" fields with valid information.
  6. Press the "Update" button to save your changes.
- **Expected result:**
  - A toast message appears at the bottom of the screen to inform you that the configuration was updated successfully, indicating a successful setting of the GitHub application configuration.

---

#### Scenario 8: Adding a new authorization method - OAuth

- **Objective:** Test the functionality of adding a new OAuth authorization in the application.
- **Prerequisites:**
  - The user is logged in to their developer account.
  - The settings drawer is open.
- **Steps:**
  1. Unfold the "Authorizations" menu.
  2. Press the "Add authorization" button to initiate the creation process for a new authorization method.
  3. Fill in the desired label for the new authorization method.
  4. Select the "OAuth" radio button.
  5. Click the "Login with Github" button.
  6. You are redirected to Github's OAuth setup page, on which you should approve any requests to add a new OAuth connection.
- **Expected result:**
  - A toast message appears at the bottom of the screen to inform the user that the new authorization has been created successfully.
  - The newly added authorization is displayed in the "Authorizations" table within the previous sub-menu inside the settings drawer.
  - The new authorization method also becomes available within the "Deploy a project" modal, allowing users to choose it for their projects.

---

#### Scenario 9: Adding a new authorization method - Personal Access Token

- **Objective:** Test the functionality of adding a new Personal Access Token authorization in the application.
- **Prerequisites:**
  - The user is logged in to their developer account.
  - The settings drawer is open.
- **Steps:**
  1. Unfold the "Authorizations" menu.
  2. Press the "Add authorization" button to initiate the creation process for a new authorization method.
  3. Fill in the desired label for the new authorization method.
  4. Select the "Personal Access Token" radio button.
  5. Fill in your desired personal access token in the text field.
  6. Press the "Confirm" button to complete the flow.
- **Expected result:**
  - A toast message appears at the bottom of the screen to inform the user that the new authorization has been created successfully.
  - The newly added authorization is displayed in the "Authorizations" table within the previous sub-menu inside the settings drawer.
  - The new authorization method also becomes available within the "Deploy a project" modal, allowing users to choose it for their projects.

---

#### Scenario 10: Private repository deployment with an authorization method

- **Objective:** Test the functionality of creating and deploying a new project within the platform.
- **Prerequisites:**
  - The user is logged in to their developer account.
  - The dashboard page is open.  
    -_If you are testing on the `demo.haddock.ovh` environment, you need to have completed the scenarios about the deploy key authorization method._
- **Steps:**
  1.  Click on the "Deploy a project" button on the top-right corner of the page.
  2.  Select the desired authorization from the configured authorizations (e.g., Personal Access Token).  
      _If you are testing on the `demo.haddock.ovh` environment, use the deploy key previously added._
  3.  Select a GitHub repository from the repositories available to the authorization method.  
      _If you are testing on the `demo.haddock.ovh` environment, fill out the `haddockapp/demo_project` repository. Since you're using the deploy key, you cannot have autocompletion for the repository name._
  4.  Select a branch to deploy from.  
      _If you are testing on the `demo.haddock.ovh` environment, use the `multiple-services` branch. For the same reason, you cannot have autocompletion for the branch name._
  5.  Enter your Docker Compose file's path inside the repository.  
      _If you are testing on the `demo.haddock.ovh` environment, use the `compose.yml` file._
  6.  Move to the next step.
  7.  Use the sliders to set your desired allocations for CPUs, Memory and Disk.  
      _If you are testing on the `demo.haddock.ovh` environment, use the `2` for CPUs, `2048` for Memory and `512` for Disk._
  8.  Press the "Create" button
- **Expected result:**
  - You'll be redirected to the project details page.
  - The project's status should become in "Running" state.
  - If you back to the dashboard, you should see the new project card in the list.

---

#### Scenario 11: Edit project informations

- **Objective:** To test the functionality of editing project information on the Haddock platform.
- **Prerequisites:**
  - A developper account is set up and logged in.
  - The project to be edited is already deployed on Haddock.
- **Steps:**
  1. Navigate to the dashboard.
  2. Locate the project to be edited from the list and click on it.  
     _If you are testing on the `demo.haddock.ovh` environment, click on the project you just created (last one in the list)._
  3. In the newly opened page, navigate to the settings tab.
  4. Click on the "Edit this Project" button that appears.
  5. Update the name and description fields with new values.  
     _If you are testing on the `demo.haddock.ovh` environment, we recommand you to update the name as `private repository` and feel free to update the description as you want. This name will be used to identify the project in the dashboard later in this document._
  6. Click the 'Edit this Project' button to save the changes.
- **Expected result:**
  - A toast message should be displayed on the bottom right side of the screen confirming the successful update of the project information.
  - The updated name should be reflected in the header of the project page.
  - The updated name and description should appear in the list of projects on the dashboard.

> **Note:**  
> If you are testing on the `demo.haddock.ovh` environment, we also recommand you to update the other project name, like you just did with the first one, as "public repository" and feel free to update the description as you want. This name will be used to identify the project in the dashboard later in this document so you have two differents name for the two projects to not be confused.\_

---

#### Scenario 12: User display preferencies in topology view

- **Objective:** To test the functionality of displaying user preferences in the topology view for a Haddock project.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the 'private repository' project._
  4. Locate the Topology tab (default one).
  5. Manipulate the nodes (services) by clicking and dragging them to rearrange them in a preferred layout within the topology view.  
     _IIf you are testing on the `demo.haddock.ovh` environment and have chosen the 'private repository' project, you will see 4 services: nginx, fastpi, db, redis._
  6. Test the functionality of showing or hiding connections between services by toggling this option on or off, respectively.
  7. Refresh the page to verify the changes made.
- **Expected result:**
  - Upon refreshing the page, the rearranged nodes (services) should be displayed in the preferred layout selected by the developer.
  - If the option to display connections was toggled off, there should be no visible lines connecting the services. Conversely, if the option to display connections was toggled on, all connections between the services should be clearly visible.

#### Scenario 13: Edit an existing project's authorization method

> **Note:**  
> If you are testing on the `demo.haddock.ovh` environment, you can skip this scenario and proceed directly to **Scenario 14**. Since you don't have any others authorization methods set up, you cannot edit the authorization method of the project.

- **Objective:** Test updating a project's authorization method.
- **Prerequisites:**

  - The user is logged in to their developer account.
  - The dashboard page is open.
  - There is an existing deployed project available.
  - The project is already deployed with the previous authorization method we provided you.

- **Objective:** Test updating a project's authorization method.
- **Prerequisites:**
  - The user is logged in to their developer account.
  - The dashboard page is open.
  - There is an existing deployed project available.
- **Steps:**
  1. On the dashboard, select an existing project from among the list of projects displayed.
  2. Move to the "Settings" tab on the project details page by clicking on it.
  3. Press the "Edit this project" button located at the top right corner of the settings page.
- **Expected result:**
  - A new toast message is generated once the edit button is pressed, confirming that the authorization method was updated successfully.

---

#### Scenario 14: Stop Project

- **Objective:** To verify that the 'Stop Project' functionality stops the project and all associated services.
- **Prerequisites:**
  - A developper account is set up and logged in.
  - The project to be stopped is already deployed and 'Running' on Haddock.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Select the desired 'Running' state project from the list.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the 'public repository' project._
  3. Click on the 'Stop Project' button.
  4. In the modal that appears, click on the 'Stop Project' button again to confirm the action.
- **Expected result:**
  - A notification with a success message about stopping the project should appear on the bottom right side of the screen.
  - The selected project's state should change from 'Running' to 'Stopped'.
  - All related services associated with the project should be stopped and their status updated accordingly.

---

#### Scenario 15: Start a Project

- **Objective:** Test the functionality of starting a Haddock project that is either stopped or in error.
- **Prerequisites:**
  - A user account with appropriate permissions to start a project.
  - The project to be started is already deployed on Haddock.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list, which is currently either stopped or in an error state.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `public repository` project._
  3. Click on the project name to open its details page.
  4. Find and click the "Start" button located near the status of the project.
- **Expected result:**
  - A notification message should appear on the bottom right side of the screen saying that the project is now starting.
  - The project status should change to "Starting".
  - After a short delay, the project status should change to "Running". This indicates that the feature works correctly and the project has successfully started or resumed.

---

#### Scenario 16: Update Project

> **Note:**  
> If you are testing on the `demo.haddock.ovh` environment and using the repositories we provided you, you can skip this scenario and proceed directly to **Scenario 17**. You cannot update the project by pushing changes to the GitHub repository.

- **Objective:** To verify that a Haddock project can be updated from its GitHub source, and the changes are reflected in the deployed application.
- **Prerequisites:**
  - A Haddock project is already deployed and accessible.
  - The project's source code resides on a GitHub repository.
  - Developer has necessary access rights to make commits on the GitHub repository.
  - The deployment system is configured to pull updates from GitHub automatically or manually.
- **Steps:**
  1. Navigate to the GitHub repository hosting the Haddock project's source code.
  2. Make a commit containing desired changes, ensuring that the changes are relevant to the project and do not break any existing functionality.
  3. Navigate to the dashboard page.
  4. Locate the desired project on the list
  5. Click on the project name to open its details page.
  6. Find and click the "Update" button located near the status of the project.
  7. Confirm the update by clicking on the appropriate modal or dialog box, as prompted by the system.
- **Expected result:**
  - A notification message should appear on the bottom right side of the screen saying that the update process has started.
  - The project will begin to recompile and restart, incorporating the new modifications from the committed changes in the GitHub repository.
  - Once the project is fully updated, it should now be running with the new modifications applied.

---

#### Scenario 17: Recreate Project

- **Objective:** To verify the functionality of recreating a stopped or error Haddock project from its page.
- **Prerequisites:**
  - A Haddock project is already deployed and accessible.
  - The project is currently in a stopped or error state.
  - A user account with appropriate permissions to recreate the project.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list, which is currently either stopped or in an error state.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `public repository` project._
  3. Click on the project name to open its details page.
  4. Find and click the "Recreate" button located near the status of the project.
  5. Confirm the recreation action in the appearing modal.
- **Expected result:**
  - A notification appears on the right bottom side of the screen, confirming the start of project recreation process.
  - The project status should change to "Starting".
  - After a short delay, the project status should change to "Running". This indicates that the feature works correctly and the project has successfully been recreated.

---

#### Scenario 18: Monitoring a deployed project

- **Objective:** Test the ability to monitor CPU, Memory, and Disk Usages for a deployed project, as well as view the project's docker logs.
- **Prerequisites:**
  - The user is logged in to their developer account.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `public repository` project._
  4. Click on the "Monitoring" tab to move to that section.
  5. Check that the CPU, Memory, and Disk Usages are displayed as a percentage ring chart and a detailed histogram for each metric.
  6. Verify that the charts are updated in real-time to reflect the current status of the project.
  7. Scroll down to view the project's docker logs at the bottom of the page.
- **Expected result:**
  - The project details page and the "Monitoring" tab should be accessible for the selected project.
  - The CPU, Memory, and Disk Usages are displayed as a percentage ring chart and a histogram for each metric.
  - The charts should update in real-time to reflect the current status of the project.
  - The project's docker logs can be viewed at the bottom of the page.  
    _If you are testing on the `demo.haddock.ovh` environment, you will see the logs of a `fastapi` project._

---

#### Scenario 19: Service View

- **Objective:** Verify that the Service View of a deployed Haddock project correctly displays all services in a React Flow.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines services in it.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  3. Click on the project name to open its details page.
  4. Locate the Topology tab (default one).
  5. Verify that the React Flow visualization is loaded on the Topology tab
- **Expected result:**
  - The entire list of services from the Compose file should be displayed in the Flow representation.
    _If you are testing on the `demo.haddock.ovh` environment, you will see the services: `nginx`, `fastpi`, `db`, `redis`._
  - Each service node should be clickable and provide additional information when clicked.

---

#### Scenario 20: Service Status

- **Objective:** To verify that the Service Status is correctly displayed for a deployed Haddock project with at least one service.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  3. Click on the project name to open its details page.
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.  
     _If you are testing on the `demo.haddock.ovh` environment, use the service `nginx`._
  6. Ensure that the drawer on the right side of the screen is opened to display the details of the chosen service
- **Expected result:**

  - The drawer should open on the right side of the screen, revealing the details of the selected service.
  - The status of the service should be displayed in the drawer.  
    _If you are testing on the `demo.haddock.ovh` environment and selected the service `nginx`, you'll see that the service is in `Running` state._
  - The image of the service should be visible in the drawer.  
    _If you are testing on the `demo.haddock.ovh` environment and selected the service `nginx`, you'll see that the image of the service is `nginx:alpine`._

---

#### Scenario 21: Service Configuration: environment variable

- **Objective:** Testing that environment variables defined in a Compose file for a Haddock project service are correctly displayed in the "Environment Variables" section on the configuration page.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
  - The service should have environment variables defined in the compose file.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.
  6. In the drawer, navigate to and open the configuration tab.  
     _If you are testing on the `demo.haddock.ovh` environment, select the service `db`._
- **Expected result:**
  - The environment variable defined in the Compose file should be correctly displayed under the "Environment Variables" section in the configuration page.
  - The displayed value should match the actual value defined within the Compose file.  
    _If you are testing on the `demo.haddock.ovh` environment and selected the service `db`, you'll see the environment variables: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` and the values of these variables which are respectively `user`, `password` and `appdb`._

---

#### Scenario 22: Service Configuration: depends on

- **Objective:** Verify that the "depends_on" services listed in the compose for a specific service are correctly displayed on the configuration page of the Haddock project.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
  - The service should have depends_on defined in the compose file.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  3. Click on the project name to open its details page.
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.  
     _If you are testing on the `demo.haddock.ovh` environment, select the service `fastapi`._
  6. In the drawer, navigate to and open the configuration tab.
  7. Locate the "depends on" section on the configuration page.
- **Expected result:**
  - All the services listed as `depends_on` in the compose for that service should be displayed correctly under the "depends on" section on the configuration page.  
    _If you are testing on the `demo.haddock.ovh` environment and selected the service `fastapi`, you'll see the services: `fastpi` and `redis` listed as `depends_on`._

---

#### Scenario 23: Service Configuration: ressource limits

- **Objective:** Test the display of resource limits in the service configuration for a deployed Haddock project.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
  - The service should have resource limits defined in the compose file.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.
  6. In the drawer, navigate to and open the configuration tab.  
     _If you are testing on the `demo.haddock.ovh` environment, select the service `fastapi`._
  7. Locate the "resource limits" section in the configuration page.
- **Expected result:**
  - The resource limits (memory, CPU, etc.) specified in the service's Compose file should be correctly displayed within the resource limits section of the service's configuration settings.  
    _If you are testing on the `demo.haddock.ovh` environment and selected the service `fastapi`, you'll see the resource limits: `memory: 512M` and `CPU: 50%`._

---

#### Scenario 24: Service Configuration: User

- **Objective:** Test the functionality of displaying user information in the Service Configuration tab for a given service within a deployed Haddock project.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
  - The service should be configured to have user defined with UID and GID.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.
  6. In the drawer, navigate to and open the configuration tab.  
     _If you are testing on the `demo.haddock.ovh` environment, select the service `fastapi`._
  7. Locate the "user" section on the configuration page.
- **Expected result:**
  - The user information provided in the Compose file (UID, GID) is correctly displayed in the Service Configuration's User section.  
    _If you are testing on the `demo.haddock.ovh` environment and selected the service `fastapi`, you'll see the user information: `UID: 1000` and `GID: 1000`._

---

#### Scenario 25: Service network: Ports list

- **Objective:** Test the display of all ports defined in the compose file under the "Ports" section for a targeted service.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
  - The compose file should define ports for that specific service.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.  
     _If you are testing on the `demo.haddock.ovh` environment, select the service `nginx`._
  6. In the drawer, navigate to and open the Network tab.
  7. Locate the "Ports" section.
- **Expected result:**
  - The "Ports" section should be visible in the Networks tab for the selected service.
  - The list of all the ports defined in the compose file should be displayed correctly in the "Ports" section.  
    _If you are testing on the `demo.haddock.ovh` environment and selected the service `nginx`, you'll see the port: `8080`._

---

#### Scenario 26: Service Network: Network list

- **Objective:** Testing that the defined networks in a Haddock project's compose file are displayed under the Networks tab of the targeted service.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
  - The compose file should define networks for that specific service.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.
  6. In the drawer, navigate to and open the Network tab.  
     _If you are testing on the `demo.haddock.ovh` environment, select the service `nginx`._
  7. Locate the "Networks" section.
- **Expected result:**
  - The "Networks" section should be visible in the Networks tab for the selected service.
  - The list of all the networks defined in the compose file should be displayed correctly in the "Networks" section.  
    _If you are testing on the `demo.haddock.ovh` environment and selected the service `nginx`, you'll see the network: `frontend`._

---

#### Scenario 27: Service network redirections: No subdomain

> **Note:**  
> If you are testing on the `demo.haddock.ovh` environment, you can skip this scenario and proceed directly to **Scenario 28**. Because you cannot create a redirection without a subdomain.

- **Objective:** To test the functionality of creating a network redirection without a subdomain in a Haddock project.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
  - The compose file should define ports for that specific service.
  - At least two domains must be pre-configured in the system to use in the redirection.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.
  6. In the drawer, navigate to and open the Network tab.
  7. Locate the Redirections section.
  8. Click on the "Add redirection" button.
  9. Choose a port from the available options in the dialog box.
  10. Leave the subdomain field empty and fill in one of the pre-configured domains.
  11. Click on the "Create" button to save the redirection settings.
- **Expected result:**
  - It must not be possible to choose the primary domain.
  - A notification message should be displayed, confirming that the redirection has been created successfully.
  - The newly created redirection should appear in the list of network redirections with the specified port and domain.
  - By accessing the Internet using the filled-in domain, you should be able to reach the targeted service via the created network redirection.

---

#### Scenario 28: Service Networks redirections: With subdomain

- **Objective:** To test the functionality of creating a network redirection with a subdomain in a Haddock project.
- **Prerequisites:**

  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
  - The compose file should define ports for that specific service.
  - One or more domains should be pre-configured in the system to use in the redirection.

- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.
  6. _If you are testing on the `demo.haddock.ovh` environment, select the service `nginx`._
  7. In the drawer, navigate to and open the Network tab.
  8. Locate the Redirections section.
  9. Click on the "Add redirection" button.
  10. Choose a port from the available options in the dialog box.  
      _If you are testing on the `demo.haddock.ovh` environment, use the port `8080`._
  11. Fill in the subdomain field with a valid subdomain.  
      _If you are testing on the `demo.haddock.ovh` environment, use the subdomain `myapi`. So you should see in the domain overview `myapi.demo.haddock.ovh`._
  12. Click on the "Create" button to save the redirection settings.
- **Expected result:**
  - A notification message should be displayed, confirming that the redirection has been created successfully.
  - The newly created redirection should appear in the list of network redirections with the specified port and full domain.
  - By accessing the Internet using the filled-in domain, you should be able to reach the targeted service via the created network redirection.  
    _If you are testing on the `demo.haddock.ovh` environment, you should see the fastapi service._

---

#### Scenario 29: Stop a service

- **Objective:** Test the functionality to stop a service in a deployed Haddock project.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
  - The service should be in a running state.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  3. Click on the project name to open its details page.
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.  
     _If you are testing on the `demo.haddock.ovh` environment, select the service `fastapi`._
  6. In the drawer, navigate to and open the Status tab (default one).
  7. Identify the 3 dots action button in the "Current Status" section and click on it.
  8. Click on the "Stop" button that appears after clicking the 3 dots action button.
- **Expected result:**
- The service should now be in a stopped state.
- A notification should be displayed, confirming that the service is now stopped.

---

#### Scenario 30: Start a service

- **Objective:** Test the functionality to start a service in a deployed Haddock project.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
  - The service should be in a stopped or error state.
- **Steps:**

  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  3. Click on the project name to open its details page.
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.  
     _If you are testing on the `demo.haddock.ovh` environment, select the service `fastapi`._
  6. In the drawer, navigate to and open the Status tab (default one).
  7. Identify the 3 dots action button in the "Current Status" section and click on it.
  8. Click on the "Start" button that appears after clicking the 3 dots action button.

- **Expected result:**
  - The service should transition from a stopped or error state to a running state.
  - A notification should be displayed, confirming that the service is now running.

---

#### Scenario 31: Restart service

- **Objective:** Test the functionality to restart a service in a deployed Haddock project.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
  - The service should be in a running state.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  3. Click on the project name to open its details page.
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.  
     _If you are testing on the `demo.haddock.ovh` environment, select the service `fastapi`._
  6. In the drawer, navigate to and open the Status tab (default one).
  7. Identify the 3 dots action button in the "Current Status" section and click on it.
  8. Click on the "Restart" button that appears after clicking the 3 dots action button.
- **Expected result:**
  - The selected service should restart successfully.
  - A notification should be displayed confirming that the service has been restarted.

---

#### Scenario 32: Add an environment variable

- **Objective:** To add an environment variable to a deployed Haddock project and verify that it appears in the list and within the VM environment.
- **Prerequisites:**
  - A valid Haddock account is set up.  
  - _If you are testing on the `demo.haddock.ovh` environment, you need to have completed the scenario about redirection and have the redirection active and working._
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Go to the "Settings" tab within the project page.
  5. Locate and expand the "Manage Environment Variables" section.
  6. Fill out the form by providing a key and value for the new environment variable, ensuring it is not marked as secret.  
     _If you are testing on the `demo.haddock.ovh` environment, put the key: `CLEAR_ENV` and the value: `clear_value`._
  7. Click on the "Add" button to submit the new environment variable
  8. Stop and Start the project to apply the modifications.
- **Expected result:**
  - The new environment variable should be created successfully.
  - The newly added environment variable should be displayed in the list within the "Manage environment variables" section.
  - The newly added environment variable should be successfully applied and accessible in the VM environment when running the project.  
    _If you are testing on the `demo.haddock.ovh` environment, you can go on the myapi.demo.haddock.ovh domain and you should see the `CLEAR_ENV` value and the `SECRET_ENV` value that is not set._
  - Since it's not secret, the value of the variable should clearly be displayed within the list without any obfuscation or masking.

---

#### Scenario 33: Add a secret environment variable

- **Objective:** Test the functionality of creating a secret environment variable for a deployed Haddock project.
- **Prerequisites:**
  - A valid Haddock account is set up.  
  - _If you are testing on the `demo.haddock.ovh` environment, you need to have completed the scenario about redirection and have the redirection active and working._
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Go to the "Settings" tab within the project page.
  5. Locate and expand the "Manage Environment Variables" section.
  6. Fill out the form by providing a key and value for the new environment variable.  
     _If you are testing on the `demo.haddock.ovh` environment, put the key: `SECRET_ENV` and the value: `secret_value`._
  7. Check the box marked 'Secret'.
  8. Click on the 'Add' button to create the new environment variable.
  9. Stop and Start the project to apply the modifications.
- **Expected result:**
  - The new environment variable should be created successfully.
  - The newly added environment variable should be successfully applied and accessible in the VM environment when running the project.  
    _If you are testing on the `demo.haddock.ovh` environment, you can go on the myapi.demo.haddock.ovh domain and you should see the `SECRET_ENV` value that is set._
  - The newly added environment variable should be displayed in the list within the "Manage environment variables" section.
  - Since the variable is secret, the value should not be visible within the project settings page.

---

#### Scenario 34: Edit non secret environment variable

- **Objective:** To test the functionality of editing a non-secret environment variable in the Haddock project.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Go to the "Settings" tab within the project page.
  5. Locate and expand the "Manage Environment Variables" section.
  6. Identify the environment variable that will be edited.
  7. Replace both the key and the value of the selected environment variable with new values.  
     _If you are testing on the `demo.haddock.ovh` environment, put the key: `CLEAR_ENV` and the value: `clear_value_edited`._
  8. Click the 'Save' button to save the changes
- **Expected result:**
  - The edited environment variable should be updated on the list.
  - The updated environment variable should be reflected in the VM environment for the deployed Haddock project.  
    _If you are testing on the `demo.haddock.ovh` environment, you can go on the myapi.demo.haddock.ovh domain and you should see the `CLEAR_ENV` value that is set to `clear_value_edited`._

---

#### Scenario 35: Change environment variable from non secret to secret

- **Objective:** Test the functionality of changing an environment variable from non-secret to secret within a project.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Go to the "Settings" tab within the project page.
  5. Locate and expand the "Manage Environment Variables" section.
  6. Check on the secret state for the variable you want to edit.  
     _If you are testing on the `demo.haddock.ovh` environment, select the variable `CLEAR_ENV`._
  7. Save the updated environment variable settings.
- **Expected result:**
  - The environment variable should be saved and updated as a secret variable.
  - The value of the environment variable shouldn't be displayed anymore.
  - The checkbox "Secret" should be checked.

---

#### Scenario 36: Edit secret environment variable

- **Objective:** Test the functionality of editing a secret environment variable in a deployed Haddock project.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Go to the "Settings" tab within the project page.
  5. Locate and expand the "Manage Environment Variables" section.
  6. Identify the secret environment variable that will be edited.
  7. Update the key and value of the variable as desired.  
     _If you are testing on the `demo.haddock.ovh` environment, put the key: `SECRET_ENV` and the value: `secret_value_edited`._
  8. Click the 'Save' button to save the changes
- **Expected result:**
  - The key and value of the identified secret environment variable should be updated with the new values provided by the developer.
  - Since the variable is secret, the updated value cannot be viewed. However, the key and the fact that it is a secret variable should remain visible.  
    _If you are testing on the `demo.haddock.ovh` environment, you can go on the myapi.demo.haddock.ovh domain and you should see the `SECRET_ENV` value that is set to `secret_value_edited`._
  - Since the variable is secret, the "Secret" checkbox should be checked and cannot be changed.

---

#### Scenario 37: Delete environment variable

- **Objective:** Test the ability to delete an environment variable in a deployed project on the platform.
- **Prerequisites:**
  - A Haddock-deployed project is accessible and active.
  - The project has at least one environment variable set.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Go to the "Settings" tab within the project page.
  5. Locate and expand the "Manage Environment Variables" section.
  6. Identify the environment variable to be deleted.  
     _If you are testing on the `demo.haddock.ovh` environment, select the variable `SECRET_ENV`._
  7. Click on the "Delete" button associated with the selected environment variable.
- **Expected result:**
  - A notification should appear on the right bottom side of the screen confirming that the action was successful.
  - The deleted environment variable should no longer be visible in the list of environment variables under the "Manage Environment Variables" section.  
    _If you are testing on the `demo.haddock.ovh` environment, you can go on the myapi.demo.haddock.ovh domain and you should see the `SECRET_ENV` value that is not set anymore._

#### Scenario 38: Editing the github application configuration

> **Note:**  
> If you are testing on the `demo.haddock.ovh` environment, you can skip this scenario and proceed directly to **Scenario 39**. You cannot edit the github application configuration on the demo environment.

- **Objective:** Test the functionality of editing the GitHub application configuration.
- **Prerequisites:**
  - The administrator is logged in to the application.
  - A valid GitHub client ID and secret exist.
- **Steps:**
  1. Open the settings drawer by clicking on the purple stack icon at the top-right corner of the screen.
  2. Unfold the "GitHub Application" sub-menu.
  3. Fill in the new "Github Client ID" and "Github Client Secret" fields with valid information.
  4. Press the "Update" button to save your changes.
- **Expected result:**
  - A toast message appears at the bottom of the screen to inform you that the configuration was updated successfully, indicating a successful edit of the GitHub application configuration.

---

#### Scenario 39: Inviting a new user

- **Objective:** To test the functionality of inviting a new user to the platform.
- **Prerequisites:**
  - A valid email address for the invited user
  - Be logged in with an active admin account
- **Steps:**
  1. Open the settings drawer by clicking on the purple stack icon at the top-right corner of the dashboard.
  2. Unfold the “Users” sub-menu and click on it to view the list of existing users.
  3. Press the “Invite User” button to invite a new user.
  4. Inside the “Invite User” modal, enter the user’s email.  
     _If you are testing on the `demo.haddock.ovh` environment, put the email: `test@haddock.ovh`._
  5. Press the “Send invitation button” to invite the user.
- **Expected result:**
  - A toast message appears at the bottom of the screen informing you that the user has been invited successfully.
  - The invited user appears in the list of users with a "invited" Role.
  - Go on another page and try to connect with the invited user.  
    _If you are testing on the `demo.haddock.ovh` environment, you should be able to connect with the invited user with the email: `test@haddock.ovh` and username: `test` and put the password `haddockpassword`._

---

#### Scenario 40: Downloading a user's personal data

- **Objective:** Test the functionality of downloading a user's personal data from the system.
- **Prerequisites:**
  - The user is logged in to their admin account.
  - The settings drawer is open.
  - There are existing users in the system.
- **Steps:**
  1. Unfold the "Users" menu.
  2. Select the desired test user with the "Member" role by clicking the three purple dots at the start of their row.  
     _If you are testing on the `demo.haddock.ovh` environment, select the user `test@haddock.ovh`._
  3. Click the "Download personal data" option.
- **Expected result:**
  - A JSON file is downloaded to the admin's machine.
  - The downloaded JSON file should contain all the necessary personal data of the selected user (e.g., name, email, roles, etc.).  
    _If you are testing on the `demo.haddock.ovh` environment, the downloaded JSON file should contain the user `test@haddock.ovh` with the name `test` and the email `test@haddock.ovh`._
  - The file format should be valid JSON and the content inside should not have any syntax errors.

---

#### Scenario 41: Delete an authorization method

> **Note:**  
> If you are testing on the `demo.haddock.ovh` environment, you can skip this scenario and proceed directly to **Scenario 42**. You cannot delete an authorization method on the demo environment.

- **Objective:** Test the functionality of deleting an authorization method in the application settings.
- **Prerequisites:**
  - The user is logged in to their developer account.
  - The settings drawer is open.
  - There is at least one existing authorization method already set up.
- **Steps:**
  1. Unfold the "Authorizations" menu.
  2. Click on the red bin icon next to an existing authorization method.
- **Expected result:**
  - The authorization method is removed from the list and no longer visible in the Authorizations section.
  - A prompt or message indicating successful deletion of the authorization method appears.

---

#### Scenario 42: Deactivate a user

- **Objective:** Test deactivation of a user's account
- **Prerequisites:**
  - The user is logged in to their admin account.
  - The settings drawer is open.
  - A test user with "Member" role and active status exists in the system.
- **Steps:**
  1. Unfold the "Users" menu.
  2. Select the desired test user with the "Member" role by clicking the three purple dots at the start of their row.  
     _If you are testing on the `demo.haddock.ovh` environment, select the user 'test@haddock.ovh'._
  3. Click the "Deactivate" option to deactivate the selected user's account.
- **Expected result:**
  - The selected user's status in the list should change from green checked circle to a red circle with a dash, indicating that their account has been deactivated.
  - Attempting to connect as the deactivated user should result in an error.  
    _If you are testing on the `demo.haddock.ovh` environment, you should not be able to connect with the deactivated user with the email: 'test@haddock.ovh' and username: 'test' and the password "haddockpassword"._

---

#### Scenario 43: Activate a user

- **Objective:** Test activation of a user's account
- **Prerequisites:**
  - The user is logged in to their admin account.
  - The settings drawer is open.
  - A test user with "Member" role and inactive status exists in the system.
- **Steps:**
  1. Unfold the "Users" menu.
  2. Select the desired test user with the "Member" role by clicking the three purple dots at the start of their row.
  3. Click the "Activate" option to activate the selected user's account.  
     _If you are testing on the `demo.haddock.ovh` environment, select the user `test@haddock.ovh`._
- **Expected result:**
  - The selected user's status in the list should change from red circle with a dash to a green checked circle, indicating that their account has been activated.
  - Attempting to connect as the activated user should succeed.  
    _If you are testing on the `demo.haddock.ovh` environment, you should be able to connect with the activated user with the email: `test@haddock.ovh` and username: `test` and the password `haddockpassword`._

---

#### Scenario 44: Change a user's password

- **Objective:** Test changing a user's password
- **Prerequisites:**
  - The user is logged in to their admin account.
  - The settings drawer is open.
  - A test user with "Member" role and active status exists in the system.
- **Steps:**
  1. Unfold the "Users" menu.
  2. Select the desired test user with the "Member" role by clicking the three purple dots at the start of their row.  
     _If you are testing on the `demo.haddock.ovh` environment, select the user `test@haddock.ovh`._
  3. Click the "Reset Password" option to open the password change dialog.
  4. A dialog prompts you to select a new password for the user.
  5. Click the "Change Password" button.
- **Expected result:**
  - Attempting to connect as the selected user with the old password should throw an error.
  - Attempting to connect as the selected user with the new password should work as a normal login.  
    _If you are testing on the `demo.haddock.ovh` environment, you should be able to connect with the activated user with the email: `test@haddock.ovh` and username: `test` and the password `haddockpassword_edited`._

---

#### Scenario 45: Delete a user

- **Objective:** Test deletion of a user's account
- **Prerequisites:**
  - The user is logged in to their admin account.
  - The settings drawer is open.
  - A test user with "Member" role and active status exists in the system.
- **Steps:**
  1. Unfold the "Users" menu.
  2. Select the desired test user with the "Member" role by clicking the three purple dots at the start of their row.  
     _If you are testing on the `demo.haddock.ovh` environment, select the user `test@haddock.ovh`._
  3. Click the "Delete" option to delete the selected user's account.
- **Expected result:**
  - The selected user should dissapear from the user list.
  - Attempting to connect as the deactivated user should throw an error.  
    _If you are testing on the `demo.haddock.ovh` environment, you should not be able to connect with the deactivated user with the email: `test@haddock.ovh` and username: `test` and the password `haddockpassword_edited`._

---

#### Scenario 46: Service Network redirection: Delete redirection

- **Objective:** Test the successful deletion of a service network redirection in a Haddock project.
- **Prerequisites:**
  - The developer should be logged into the Haddock platform and have access to the specified project.
  - That project should have a compose file inside that defines at least one service in it.
  - The service already has an active redirection.
- **Steps:**
  1. Navigate to the dashboard page.
  2. Locate the desired project on the list.
  3. Click on the project name to open its details page.  
     _If you are testing on the `demo.haddock.ovh` environment, choose the `private repository` project._
  4. Locate the Topology tab (default one).
  5. Click on the selected service node.  
     _If you are testing on the `demo.haddock.ovh` environment, select the service `nginx`._
  6. In the drawer, navigate to and open the Network tab.
  7. Locate the Redirections section.
  8. Click on the trash button next to the selected redirection.  
     _If you are testing on the `demo.haddock.ovh` environment, select the redirection `myapi.demo.haddock.ovh`._
  9. Click on the delete button in the dialog.
- **Expected result:**
  - A notification should be displayed saying that the redirection has been successfully deleted.
  - The deleted redirection should no longer appear in the Redirections list.
  - It should no longer be possible to access the service on the internet using the previous domain associated with the deleted redirection.  
    _If you are testing on the `demo.haddock.ovh` environment, you should not be able to access the service on the internet using the previous domain associated with the deleted redirection._

---

#### Scenario 47: Delete project

- **Objective:** To verify that a project can be successfully deleted and the user is redirected to the dashboard page where the deleted project is no longer displayed.
- **Prerequisites:**

  - A developper account is set up and logged in.
  - The project to be deleted is already deployed on Haddock.

- **Steps:**
  1.  Navigate to the Dashboard page.
  2.  Identify the desired project on the dashboard.  
      _If you are testing on the `demo.haddock.ovh` environment, choose the `public repository` project._
  3.  Click on the project to access its details page.
  4.  Locate and click on the 'Settings' tab.
  5.  Find the 'Delete Project' button, then click on it.
  6.  Wait for 3 seconds after the modal appears.
  7.  Click on the 'Delete Project' button in the modal.
- **Expected result:**
  - The developer should be redirected to the Dashboard page.
  - The deleted project should no longer appear on the Dashboard.
  - There should be a confirmation message indicating that the project has been successfully deleted.  
    _If you are testing on the `demo.haddock.ovh` environment, the public repository project should not be displayed anymore on the dashboard._

---

#### Scenario 48: Logout

- **Objective:** Test the logout feature
- **Prerequisites:**
  - The user is logged in to their account.
  - The settings drawer is open.
- **Steps:**
  1. Click the "Logout" button at the bottom of the drawer.
- **Expected result:**
  - The user should be redirected to the login page and lose access to the dashboard and other account-specific features.

---

## 3.1.2 Future Roadmap

This section presents Haddock's development roadmap, organized into three major milestones for the upcoming months.

### Milestone 1 (August to October 2024)

**Objective:** Cross-platform compatibility improvement and authentication reliability

The priorities for this first phase will be cross-platform compatibility, authentication reliability, and comprehensive deployment options coverage:

- **Finalize Windows installer**  
  Complete adaptation of the installer to support Windows environments, ensuring a smooth installation experience across all major platforms.

- **Integrate update mechanisms**  
  Implementation of automatic or semi-automatic update systems to maintain Haddock instances up-to-date without complex manual intervention.

- **Enable SSO (SAML) configuration**  
  SAML support implementation to enable integration with enterprise single sign-on authentication systems.

- **Enable project creation from ZIP files or templates**  
  Extension of deployment options beyond Git repositories to support direct project import via ZIP archives or predefined templates.

---

### Milestone 2 (November to December 2024)

**Objective:** Project management improvement and advanced features introduction

This iteration will improve project management, data accessibility, and introduce the first advanced features:

- **Complete logging system (filtering, export)**  
  Enhancement of the logging system with advanced filtering capabilities, export and archiving features to facilitate debugging and monitoring.

- **Interactive shell functionality in browser**  
  Integration of a web terminal allowing developers to interact directly with their containers from the Haddock interface.

- **Add automatic backup, restoration and project versioning management**  
  Implementation of an automatic backup system with restoration capabilities and version management to secure project data.

- **Complete project configuration tabs (volumes, startup, deployment, members)**  
  Extension of the configuration interface to cover all aspects of project management: persistent volumes, startup parameters, deployment options, and member management.

---

### Milestone 3 (January to March 2025)

**Objective:** One-Click application catalog introduction and DevOps opening

The goal will be to introduce the One-Click application catalog, designed to simplify product adoption and enable other DevOps practices:

- **Develop application catalog interface**  
  Creation of a dedicated user interface for the application catalog allowing discovery, installation, and management of pre-configured applications with one click.

- **Organize GitHub template storage**  
  Structuring and organization of a centralized GitHub repository containing all application templates from the catalog, with associated documentation and metadata.

- **Implement CLI for CI/CD pipelines and others**  
  Development of a command-line interface enabling Haddock integration into existing CI/CD pipelines and deployment automation.

- **WCAG compliance and accessibility**  
  Audit and compliance of the user interface with WCAG standards to ensure accessibility for all users.

- **Extend VM model to cloud or network solutions**  
  Extension of the current architecture to support deployment on cloud infrastructures (AWS, GCP, Azure) and distributed network environments.

---

## 3.2. Data Sets

For testing Haddock, different data sets will be used:

### 3.2.1 Valid Data

_Any provided data mentioned here are valid and can be found in the **Appendices** section._

- You'll need a machine which Haddock can be installed on (e.g. Debian 12). We provided you an already deployed Haddock instance on our demo environment.
- You'll need an email to register a new account.
- You'll need another email to invite a new user and login as them.
- You'll need a valid github account if you want to use GitHub OAuth, or create your own personal access token or deploy key.
- If you cannot have any github account, we provided you a valid github deploy key that you can use to deploy a project. But you cannot have autocompletion on the repositories list and branches list. For thoses reasons, we also provided you a demo repository name with different branches to deploy from.
- If you want to try the domain setup, you'll need a valid domain name that you can access.
- If you cannot have any domain, you can use the haddock account on our demo environment and skip the register / onboarding / domain setup.
- You need a valid compose file to deploy a project. Although we provided valids compose files that contains valid services and everything to run the tests. Feel free to use the one you prefer but we do recommend to use the one we provided to avoid any mistakes.

### 3.2.2 Invalid Data

- A machine which Haddock cannot be installed on (e.g. MacOS).
- An invalid github account, personal access token or deploy key.
- An invalid domain name.
- An invalid compose file that doesn't build and run.
- If you invite a new user, an invalid email.

### 3.2.3 Borderline Cases

- Nothing for now.

---

## 4. Acceptance Criteria

A test scenario is **validated** if:

- All expected results are obtained.
- No blocking/critical anomalies are encountered.
- The system behaves consistently without crashes.

---

## 5. Appendices

### 5.1 Provided Data Sets

The following items required for the acceptance tests are provided (without details here):

- Machine with Haddock pre-installed (demo environment)
- Pre-installed and configured Haddock instance on the demo environment
- Deploy key
- Demo repository name
- List of branches for the demo repository
- Valid compose files for project deployment (with valid services and everything to run the tests)

All details and credentials for these items can be found in the zip file containing every information that you need.

---
