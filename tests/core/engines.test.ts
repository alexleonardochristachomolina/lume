import { assertStrictEquals as equals } from "../../deps/assert.ts";
import Site from "../../core/site.ts";

import type { Engine } from "../../core/renderer.ts";

Deno.test("Engines", async (t) => {
  const site = new Site();

  const { formats, renderer } = site;

  equals(formats.size, 0);

  await t.step("Add a template engine", () => {
    site.loadPages(
      [".foo"],
      {
        engine: new class implements Engine {
          includes = "";
          render(
            content: string,
            data: Record<string, unknown>,
          ): Promise<string> {
            return Promise.resolve(this.renderComponent(content, data));
          }
          renderComponent(
            content: string,
            data: Record<string, unknown>,
          ): string {
            return content + data.foo;
          }
          addHelper() {}
          deleteCache() {}
        }(),
      },
    );

    equals(formats.size, 1);
  });

  await t.step("Run the template engine", async () => {
    const result = await renderer.render("content", { foo: "bar" }, "foo.foo");
    equals(result, "contentbar");

    const result2 = await renderer.render(
      "content",
      { foo: "bar" },
      "foo.not_found",
    );
    equals(result2, "content");
  });

  await t.step("Add other template engine", () => {
    site.loadPages(
      [".upper"],
      {
        engine: new class implements Engine {
          includes = "";
          render(content: string): Promise<string> {
            return Promise.resolve(this.renderComponent(content));
          }
          renderComponent(content: string): string {
            return content.toUpperCase();
          }
          addHelper() {}
          deleteCache() {}
        }(),
      },
    );

    equals(formats.size, 2);
  });

  await t.step("Run the other template engine", async () => {
    const result = await renderer.render(
      "content",
      { foo: "bar" },
      "foo.upper",
    );
    equals(result, "CONTENT");

    const result2 = await renderer.render(
      "content",
      { foo: "bar" },
      "foo.not_found",
    );
    equals(result2, "content");
  });

  await t.step("templateEngine variable", async () => {
    const result = await renderer.render("content", {
      foo: "bar",
      templateEngine: "foo",
    }, "foo.upper");
    equals(result, "contentbar");

    const result2 = await renderer.render("content", {
      foo: "bar",
      templateEngine: ["foo", "upper"],
    }, "foo.not_found");
    equals(result2, "CONTENTBAR");

    const result3 = await renderer.render("content", {
      foo: "bar",
      templateEngine: "upper,foo",
    }, "foo.not_found");
    equals(result3, "CONTENTbar");
  });

  await t.step("Add a helper", () => {
    renderer.addHelper("quoted", (val: string) => `"${val}"`, {
      type: "filter",
    });
    equals(renderer.helpers.has("quoted"), true);
  });
});
