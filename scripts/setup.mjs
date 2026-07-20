import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootDirectory = process.cwd();

const projects = [
  {
    name: "API",
    directory: "api",
  },
  {
    name: "BFF",
    directory: "bff",
  },
  {
    name: "Frontend",
    directory: "frontend",
  },
];

function run(command, args, cwd = rootDirectory) {
  console.log(`\n> ${command} ${args.join(" ")}`);

  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function copyEnvironmentFile(directory) {
  const examplePath = resolve(rootDirectory, directory, ".env.example");

  const environmentPath = resolve(rootDirectory, directory, ".env");

  if (existsSync(environmentPath)) {
    console.log(`✓ ${directory}/.env já existe`);

    if (directory === "frontend") {
      const contents = readFileSync(environmentPath, "utf8");

      if (!contents.includes("VITE_BFF_BASE_URL=")) {
        console.warn(
          "! frontend/.env sem VITE_BFF_BASE_URL — copie de .env.example",
        );
      }
    }

    return;
  }

  if (!existsSync(examplePath)) {
    console.warn(`! ${directory}/.env.example não encontrado`);

    return;
  }

  copyFileSync(examplePath, environmentPath);

  console.log(`✓ ${directory}/.env criado a partir do exemplo`);
}

console.log("\nPreparando Task Manager...");

run("npm", ["install"]);

for (const project of projects) {
  console.log(`\nInstalando dependências: ${project.name}`);

  run("npm", ["install"], resolve(rootDirectory, project.directory));

  copyEnvironmentFile(project.directory);
}

console.log("\nGerando Prisma Client...");

run("npm", ["--prefix", "api", "run", "prisma:generate"]);

console.log(`
Configuração concluída.

Confira as credenciais em:
  api/.env

Depois execute:
  npm run prisma:migrate
  npm run prisma:seed
  npm run dev
`);
