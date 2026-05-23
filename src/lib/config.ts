import Conf from "conf";

export interface CliConfig {
  base_url?: string;
  default_format?: "json" | "csv" | "table";
}

let store: Conf<CliConfig> | undefined;

export function configStore(): Conf<CliConfig> {
  if (!store) {
    store = new Conf<CliConfig>({
      projectName: "pronto",
      configName: "config",
      schema: {
        base_url: { type: "string" },
        default_format: { type: "string", enum: ["json", "csv", "table"] },
      },
    });
  }
  return store;
}

export function configPath(): string {
  return configStore().path;
}
