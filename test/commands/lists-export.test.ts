import { describe, expect, it, vi } from "vitest";
import { collectListRows } from "../../src/commands/lists/export.js";

describe("collectListRows", () => {
  it("reads a single-page list once", async () => {
    const fetchPage = vi.fn().mockResolvedValue({ companies: [{ company_name: "Acme" }] });

    await collectListRows(fetchPage);

    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("follows next_cursor until the last page", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({
        companies: [{ company_name: "Acme" }],
        pagination: { has_more: true, next_cursor: "page-2" },
      })
      .mockResolvedValueOnce({
        companies: [{ company_name: "Globex" }],
        pagination: { has_more: false },
      });

    const rows = await collectListRows(fetchPage);

    expect(rows.map((row) => row.company_name)).toEqual(["Acme", "Globex"]);
  });

  it("asks for the next page with the cursor it was given", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({
        companies: [],
        pagination: { has_more: true, next_cursor: "page-2" },
      })
      .mockResolvedValueOnce({ companies: [], pagination: { has_more: false } });

    await collectListRows(fetchPage);

    expect(fetchPage).toHaveBeenLastCalledWith("page-2");
  });
});
