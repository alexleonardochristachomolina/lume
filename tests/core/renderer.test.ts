import { assert, assertStrictEquals as equals } from "../../deps/assert.ts";
import { build, getSite } from "../utils.ts";
import { parseDate } from "../../core/utils/date.ts";

Deno.test("Prepare page (Renderer)", async (t) => {
  const site = getSite({
    src: "simple",
  });

  await build(site);

  await t.step("Calculate the date", () => {
    const date = parseDate("2020-01-01");
    assert(date instanceof Date);
    equals(date.getFullYear(), 2020);
    equals(date.getMonth(), 0);
    equals(date.getDate(), 1);
    equals(date.getHours(), 0);
    equals(date.getMinutes(), 0);
    equals(date.getSeconds(), 0);
  });

  await t.step("Calculate the datetime", () => {
    const date = parseDate("2021-01-01 03:10:10");
    assert(date instanceof Date);
    equals(date.getFullYear(), 2021);
    equals(date.getMonth(), 0);
    equals(date.getDate(), 1);
    equals(date.getHours(), 3);
    equals(date.getMinutes(), 10);
    equals(date.getSeconds(), 10);
  });

  await t.step("Calculate ISO datestimes", () => {
    const date = parseDate("2021-01-01T03:10:10Z");
    assert(date instanceof Date);
    equals(date.getFullYear(), 2021);
    equals(date.getMonth(), 0);
    equals(date.getDate(), 1);
    equals(date.getHours(), 3);
    equals(date.getMinutes(), 10);
    equals(date.getSeconds(), 10);
  });

  await t.step("Calculate ISO datestimes 2", () => {
    const date = parseDate("2021-01-01T03:10:10-0700");
    assert(date instanceof Date);
    equals(date.getFullYear(), 2021);
    equals(date.getMonth(), 0);
    equals(date.getDate(), 1);
    equals(date.getHours(), 10);
    equals(date.getMinutes(), 10);
    equals(date.getSeconds(), 10);
  });

  await t.step("Calculate ISO datestimes 3", () => {
    const date = parseDate("20210101");
    assert(date instanceof Date);
    equals(date.getFullYear(), 2021);
    equals(date.getMonth(), 0);
    equals(date.getDate(), 1);
    equals(date.getHours(), 0);
    equals(date.getMinutes(), 0);
    equals(date.getSeconds(), 0);
  });

  await t.step("Calculate ISO datestimes 4", () => {
    const date = parseDate("20210101T031010Z");
    assert(date instanceof Date);
    equals(date.getFullYear(), 2021);
    equals(date.getMonth(), 0);
    equals(date.getDate(), 1);
    equals(date.getHours(), 3);
    equals(date.getMinutes(), 10);
    equals(date.getSeconds(), 10);
  });
});
