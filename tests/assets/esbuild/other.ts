/// <reference lib="dom" />
import toUppercase from "./modules/to_uppercase.ts";

document.querySelectorAll(".other")?.forEach((el) => {
  el.innerHTML = toUppercase(el.innerHTML);
});
