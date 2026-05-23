import { describe, expect, it } from "vitest";
import { render } from "../../src/output/format.js";

describe("render", () => {
  it("renders JSON for primitives", () => {
    expect(render({ a: 1 }, "json")).toBe('{\n  "a": 1\n}');
  });

  it("renders CSV with headers", () => {
    const csv = render([{ a: 1, b: 2 }, { a: 3, b: 4 }], "csv");
    expect(csv.split("\n")[0]).toBe("a,b");
    expect(csv).toContain("1,2");
    expect(csv).toContain("3,4");
  });

  it("renders a table with column headers", () => {
    const t = render([{ name: "Ada" }, { name: "Grace" }], "table");
    expect(t).toContain("name");
    expect(t).toContain("Ada");
    expect(t).toContain("Grace");
  });

  it("flattens nested objects in row mode", () => {
    const csv = render([{ a: { x: 1 } }], "csv");
    expect(csv).toContain('"{""x"":1}"');
  });

  it("returns '(no results)' for empty arrays in table mode", () => {
    expect(render([], "table")).toBe("(no results)");
  });
});
