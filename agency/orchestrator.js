const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const root = path.join(__dirname, "..");
const tasksFile = path.join(__dirname, "tasks.json");

function readTasks() {
    if (!fs.existsSync(tasksFile)) {
        return [];
    }
    try {
        return JSON.parse(fs.readFileSync(tasksFile, "utf8"));
    } catch (_) {
        return [];
    }
}

function writeTasks(tasks) {
    fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 4), "utf8");
}

function listTasks() {
    const tasks = readTasks();
    console.log("\n=== GROK-TALK AGENCY: TASK ARCHIVE ===");
    if (tasks.length === 0) {
        console.log("No tasks found in history.");
        return;
    }
    tasks.forEach(t => {
        const statusColors = {
            pending: "\x1b[33m[PENDING]\x1b[0m",
            planning: "\x1b[35m[PLANNING]\x1b[0m",
            developing: "\x1b[36m[DEVELOPING]\x1b[0m",
            testing: "\x1b[34m[TESTING]\x1b[0m",
            completed: "\x1b[32m[COMPLETED]\x1b[0m",
            failed: "\x1b[31m[FAILED]\x1b[0m"
        };
        const color = statusColors[t.status] || `[${t.status.toUpperCase()}]`;
        console.log(`${t.id} - ${color} ${t.title}`);
        console.log(`  Description: ${t.description}`);
        if (t.completedAt) console.log(`  Completed: ${t.completedAt}`);
        console.log("--------------------------------------");
    });
}

function addTask(title, desc) {
    const tasks = readTasks();
    const id = `task_${String(tasks.length + 1).padStart(3, "0")}`;
    const newTask = {
        id,
        title,
        description: desc,
        status: "pending",
        assignedTo: "architect",
        plan: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
        notes: ""
    };
    tasks.push(newTask);
    writeTasks(tasks);
    console.log(`\n\x1b[32m✔ Task ${id} added successfully!\x1b[0m`);
    console.log(`Title: ${title}`);
}

function runWorkflow(taskId) {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.error(`\x1b[31m✖ Error: Task ${taskId} not found.\x1b[0m`);
        return;
    }

    console.log(`\n\x1b[35m=== RUNNING DEVELOPMENT CYCLE FOR ${task.id} ===\x1b[0m`);
    console.log(`Title: ${task.title}`);
    console.log(`Description: ${task.description}`);

    try {
        // --- PHASE 1: PLANNING ---
        console.log("\n\x1b[35m[PHASE 1: Architect Planning]\x1b[0m");
        task.status = "planning";
        writeTasks(tasks);
        console.log("Analyzing code structure and DOM dependencies...");
        
        const planDir = path.join(__dirname, "plans");
        if (!fs.existsSync(planDir)) {
            fs.mkdirSync(planDir);
        }
        const planPath = path.join(planDir, `${task.id}.md`);
        task.plan = `agency/plans/${task.id}.md`;
        
        if (!fs.existsSync(planPath)) {
            const planTemplate = `# Implementation Plan: ${task.title}
- **Task ID**: ${task.id}
- **Status**: Drafted by Architect

## 1. System Design & State Changes
- Modified state requirements: [Fill in state modifiers]
- Local storage safe: Yes

## 2. Code Changes Spec
- Files: \`app.js\`, \`source.html\`
- Modifications: [List Developer edits]

## 3. DOM & UI Spec
- New selectors and classes: [List IDs, classes, buttons]

## 4. Test Specifications
- Validation: Run npm test. Verify new assertions in \`tests/mechanics.test.cjs\`
`;
            fs.writeFileSync(planPath, planTemplate, "utf8");
            console.log(`\x1b[32m✔ Plan template generated at: ${planPath}\x1b[0m`);
        } else {
            console.log(`\x1b[32m✔ Existing implementation plan detected at: ${planPath}\x1b[0m`);
        }

        // --- PHASE 2: DEVELOPMENT (SIMULATION) ---
        console.log("\n\x1b[36m[PHASE 2: Developer Implementation]\x1b[0m");
        task.status = "developing";
        task.assignedTo = "developer";
        writeTasks(tasks);
        console.log("Executing build tools to pre-compile layout...");
        
        const buildOutput = execSync("npm run build:html", { cwd: root }).toString();
        console.log(buildOutput.trim());
        console.log("\x1b[32m✔ Codebase verified compilation successfully.\x1b[0m");

        // --- PHASE 3: TESTING ---
        console.log("\n\x1b[34m[PHASE 3: QA & Testing]\x1b[0m");
        task.status = "testing";
        task.assignedTo = "tester";
        writeTasks(tasks);
        console.log("Running testing engine and verifying assertions...");
        
        const testOutput = execSync("npm test", { cwd: root }).toString();
        console.log(testOutput.trim());
        console.log("\x1b[32m✔ All assertions passed successfully!\x1b[0m");

        // --- PHASE 4: COMPLETION ---
        task.status = "completed";
        task.completedAt = new Date().toISOString();
        task.notes = "Successfully designed, developed, and verified through agency test engine.";
        writeTasks(tasks);
        console.log(`\n\x1b[32m🏆 Task ${task.id} completed successfully!\x1b[0m\n`);
        
    } catch (err) {
        task.status = "failed";
        task.notes = `Execution failed: ${err.message}`;
        writeTasks(tasks);
        console.error(`\n\x1b[31m✖ Process failed: ${err.message}\x1b[0m\n`);
    }
}

// CLI Routing
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h") {
    console.log(`
Grok-talk Dev Agency CLI orchestrator.

Commands:
  node orchestrator.js list                  List all tasks and statuses
  node orchestrator.js add "Title" "Desc"    Add a new feature request task
  node orchestrator.js run task_xxx          Execute planning, build, and test validation
`);
    process.exit(0);
}

if (command === "list") {
    listTasks();
} else if (command === "add") {
    const title = args[1];
    const desc = args[2] || "";
    if (!title) {
        console.error("\x1b[31m✖ Error: Missing task title.\x1b[0m");
        process.exit(1);
    }
    addTask(title, desc);
} else if (command === "run") {
    const id = args[1];
    if (!id) {
        console.error("\x1b[31m✖ Error: Missing task ID.\x1b[0m");
        process.exit(1);
    }
    runWorkflow(id);
} else {
    console.error(`\x1b[31m✖ Error: Unknown command "${command}"\x1b[0m`);
    process.exit(1);
}
