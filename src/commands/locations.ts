import { Args } from "@oclif/core";
import { Locations } from "../api/endpoints.js";
import { PipecornCommand } from "../lib/base-command.js";

export default class LocationsSearch extends PipecornCommand {
  static override description =
    "Resolve a free-text location to LinkedIn geoRegion IDs (use with --included-locations).";

  static override args = {
    query: Args.string({ description: "Location query (e.g. 'Paris')", required: true }),
  };

  static override flags = { ...PipecornCommand.baseFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(LocationsSearch);
    const client = await this.client(flags["api-key"]);
    const result = await Locations.search(client, { query: args.query });
    this.emit(result, flags.format);
  }
}
