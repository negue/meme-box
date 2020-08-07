import { SafePipe } from "./safe-url.pipe";

describe("SafePipe", () => {
  it("create an instance", () => {
    const pipe = new SafePipe("test");
    expect(pipe).toBeTruthy();
  });
});
