# AI Coding Agent

- A lightweight, cross-platform coding agent that runs right in your browser.

## Features

- **Cross-Platform Built-in Tools** — Includes `bash`, `ls`, `write`, `edit`, `view`, `grep`, `glob`, and `fetch`, designed to work across different operating systems.
- **Custom AI Providers** — Add custom providers and configure their API keys, and models.
- **MCP Extensibility** — Extend the agent's capabilities by connecting MCP servers to integrate additional tools.
- **Human-in-the-Loop Execution** — Control Bash command execution with configurable approval policies, keeping potentially dangerous operations under user control.
- **Real-Time Streaming & Observability** — Stream LLM response tokens and tool execution events in real time, monitor agent execution, and inspect tool calls for better debugging and transparency.

## Tech Stack

- **Backend:** Node.js, NestJS, SQLite, MikroORM
- **Frontend:** React, Tailwind CSS, shadcn/ui
- **AI Agent Frameworks:** LangChain, LangGraph

## Installation

1. Install [Node.js 24 or later](https://nodejs.org/).

2. Install pnpm:

   ```bash
   npm install -g pnpm
   ```

3. Install the NestJS CLI:

   ```bash
   pnpm add -g @nestjs/cli
   ```

4. Clone the repository and navigate to the project directory:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

5. Install dependencies:

   ```bash
   pnpm install
   ```

6. Build the project:

   ```bash
   pnpm run build
   ```

7. Run database migrations:

   ```bash
   pnpm run migration:up
   ```

8. Start the application in production mode:
   ```bash
   pnpm run start:prod
   ```

## Configuration

### Adding MCP Servers

To extend the agent with custom tools via the Model Context Protocol (MCP), you need to set up your servers configuration file:

1. Create a directory named `config` in the root of your project directory.
2. Inside the `config/` folder, create a file named `mcp.json`.
3. Add your MCP servers using the following example structure:

```json
{
  "servers": {
    "context7": {
      "url": "[https://mcp.context7.com/mcp](https://mcp.context7.com/mcp)",
      "headers": {
        "CONTEXT7_API_KEY": "your_api_key"
      }
    }
  }
}
```

4. Head over to the UI settings, navigate to the MCP tab, and click the Reload MCP button to load your newly added servers.

## Screenshots

### 1. Add AI Provider

![Add AI Provider](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041927/1-add-provider_z1ozmy.png)

### 2. Edit AI Provider

![Edit AI Provider](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041924/2-edit-provider_c9txy0.png)

### 3. MCP Server Loading

![MCP Server Loading](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041921/3-mcp-loading_rg29gv.png)

### 4. GitHub MCP Connected

![GitHub MCP Connected](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041934/4-github-mcp-loaded_hwfojs.png)

### 5. GitHub MCP Prompt

![GitHub MCP Prompt](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041921/5-github-mcp-prompt_xyuk7q.png)

### 6. GitHub MCP Response

![GitHub MCP Response](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041918/6-github-mcp-response_zpglgl.png)

### 7. Context7 MCP

![Context7 MCP](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041928/7-context7_uocagl.png)

### 8. Command Approval Interrupt

![Command Approval Interrupt](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793044597/command-interrupt_o1exrq.png)

### 9. Change Agent Behavior

![Change Agent Behavior](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793044597/change-agent-behavior_de9ii2.png)

### 10. Add Project

![Add Project](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041938/8-add-project_yjluku.png)

### 11. Choose Project

![Choose Project](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041938/9-choosing-project_fyy668.png)

### 12. Choose AI Model

![Choose AI Model](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041937/10-choosing-model_kiizaa.png)

### 13. Agent Waiting

![Agent Waiting](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041941/11-waiting_bwvqna.png)

### 14. Tool Calls

![Tool Calls](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041945/12-tool-calls_wefkic.png)

### 15. View Tool Call

![View Tool Call](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041944/13-view-tool-call_u2u4xv.png)

### 16. Edit Tool Call

![Edit Tool Call](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041943/14-edit-tool-call_xaifek.png)

### 17. Fetch Tool Call

![Fetch Problem-Solving Accounts](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041949/15-fetch-problem-solving-accounts_c8hvnv.png)

### 18. Theme Customization

![Theme Customization](https://res.cloudinary.com/djo9k9gbx/image/upload/v1793041946/16-theme_lbfaff.png)

