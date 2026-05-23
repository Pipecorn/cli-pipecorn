import { Args } from "@oclif/core";
import { Personas } from "../../api/endpoints.js";
import { ProntoCommand } from "../../lib/base-command.js";

export default class PersonasShow extends ProntoCommand {
  static override description = "Show a single persona.";

  static override args = {
    uuid: Args.string({ description: "Persona UUID", required: true }),
  };

  static override flags = { ...ProntoCommand.baseFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(PersonasShow);
    const client = await this.client(flags["api-key"]);
    const result = await Personas.get(client, args.uuid);
    this.emit(result, flags.format);
  }
}
