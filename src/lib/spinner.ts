import ora, { type Ora } from "ora";

export function spinner(text: string, quiet: boolean): Pick<Ora, "succeed" | "fail" | "stop" | "text" | "start"> {
  if (quiet || !process.stderr.isTTY) {
    return {
      start: () => noop(),
      succeed: () => noop(),
      fail: () => noop(),
      stop: () => noop(),
      text: "",
    } as unknown as Ora;
  }
  return ora({ text, stream: process.stderr }).start();
}

function noop(): Ora {
  // Returned typing doesn't matter — never used.
  return undefined as unknown as Ora;
}
