import { Personas } from "../../api/endpoints.js";
import { ProntoCommand } from "../../lib/base-command.js";

export default class PersonasList extends ProntoCommand {
  static override description = "List ICP personas.";

  static override flags = { ...ProntoCommand.baseFlags };

  async run(): Promise<void> {
    const { flags } = await this.parse(PersonasList);
    const client = await this.client(flags["api-key"]);
    const result = await Personas.list(client);
    this.emit(result, flags.format);
  }
}
