import {
  createServer as createViteServer,
  createLogger,
} from "vite";
import { log } from "./index.js";

const viteLogger = createLogger();

export function logVite(msg, source = "vite") {
  const coloredMessage = `\x1b[36m${msg}\x1b[0m`;
  log(coloredMessage, source);
}

export async function setupVite(httpServer, app) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server: httpServer },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    configFile: "vite.config.js",
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = (await import("fs")).readFileSync(
        (await import("path")).resolve("frontend", "index.html"),
        "utf-8",
      );

      const template = await vite.transformIndexHtml(url, clientTemplate);

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
