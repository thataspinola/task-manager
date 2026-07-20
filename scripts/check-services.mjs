const services = [
  {
    name: "API",
    url: "http://localhost:3001/api/health",
  },
  {
    name: "BFF",
    url: "http://localhost:3002/api/health",
  },
  {
    name: "Frontend",
    url: "http://localhost:5173",
  },
];

const TIMEOUT_MS = 5_000;

async function checkService(service) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const response = await fetch(service.url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ...service,
        ok: false,
        detail: `HTTP ${response.status}`,
      };
    }

    return {
      ...service,
      ok: true,
      detail: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ...service,
      ok: false,
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    };
  } finally {
    clearTimeout(timeout);
  }
}

const results = await Promise.all(services.map(checkService));

console.log("\nTask Manager — serviços\n");

for (const result of results) {
  const symbol = result.ok ? "✓" : "✗";

  console.log(
    `${symbol} ${result.name.padEnd(10)} ${result.url} — ${result.detail}`,
  );
}

const unavailableServices = results.filter((result) => !result.ok);

if (unavailableServices.length > 0) {
  console.error(
    `\n${unavailableServices.length} serviço(s) indisponível(is).\n`,
  );

  process.exitCode = 1;
} else {
  console.log("\nTodos os serviços estão disponíveis.\n");
}
