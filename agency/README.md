# Grok-talk Development Agency

Welcome to the **Grok-talk Development Agency**, an autonomous agentic framework designed to evolve and enhance the **FusionPanda Master** web application. 

This agency consists of specialized roles working in a cooperative loop to design, implement, and verify features and bug fixes.

---

## 🏢 Agency Architecture

The agency is organized into three specialized divisions coordinate by a central orchestrator:

```
                  ┌──────────────────────┐
                  │     Orchestrator     │
                  └──────────┬───────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
   ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
   │   Architect    │ │  Developer   │ │  QA / Tester │
   │  System Design │ │ Code Edits   │ │ Assertions   │
   └────────────────┘ └──────────────┘ └──────────────┘
```

1. **[Architect](roles/architect.md)**: Analyzes the codebase, assesses impacts on DOM hooks and LocalStorage states, and writes a detailed Implementation Plan.
2. **[Developer](roles/developer.md)**: Receives the Implementation Plan, executes precise file content replacements inside `app.js` and `source.html`, and verifies state preservation.
3. **[Tester](roles/tester.md)**: Compiles the source files, adds new assertions to the Node test suites (`tests/`), and executes automated verifications to guarantee zero regression.

---

## 📂 Directory Structure

- **[roles/](roles/)**: Role instructions and system prompts for each agent.
- **`plans/`**: Markdown implementations drafted by the Architect for each task.
- **`orchestrator.js`**: The central workflow engine that drives task states (Pending ➔ Planning ➔ Developing ➔ Testing ➔ Completed/Failed) and executes local builds/tests.
- **`tasks.json`**: The persistent task history database.

---

## 🛠 Usage Instructions

You can manage the agency workflow using the central Orchestrator CLI.

### 1. View Task Archive
List all tasks in the backlog along with their current status, description, and completion logs:
```bash
node agency/orchestrator.js list
```

### 2. File a Feature Request / Add a Task
Add a new feature request or bug report to the queue:
```bash
node agency/orchestrator.js add "Add Combat Training Upgrade" "Create a shop card for Battle Training that boosts player damage in the arena"
```

### 3. Run the Development Loop
Trigger the orchestrator to run the complete loop (Planning, Development compiling, Test suite verification):
```bash
node agency/orchestrator.js run task_002
```
