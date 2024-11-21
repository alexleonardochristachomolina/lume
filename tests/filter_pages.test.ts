import { assertSiteSnapshot, build, getSite } from "./utils.ts";
import filter_pages from "../plugins/filter_pages.ts";

Deno.test("Filter pages (allow only /multiple/*)", async (t) => {
  const site = getSite({
    src: "module",
  });

  site.use(filter_pages({
    fn(page) {
      return page.data.url.startsWith("/multiple/");
    },
  }));

  await build(site);
  await assertSiteSnapshot(t, site);
});
