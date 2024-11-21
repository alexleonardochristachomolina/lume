import { merge } from "../core/utils/object.ts";
import { read } from "../core/utils/read.ts";
import { insertContent } from "../core/utils/page_content.ts";
import {
  createGenerator,
  MagicString,
  presetUno,
  resetUrl,
  transformerDirectives,
  transformerVariantGroup,
} from "../deps/unocss.ts";

import type Site from "../core/site.ts";
import type {
  SourceCodeTransformer,
  UnocssPluginContext,
  UserConfig,
} from "../deps/unocss.ts";

export interface Options {
  /**
   * Configurations for UnoCSS.
   * @see https://unocss.dev/guide/config-file
   * @default
   * {
   *  presets: [presetUno()]
   * }
   */
  options?: UserConfig;

  /**
   * Set the css filename for all generated styles,
   * Set to `false` to insert a <style> tag per page.
   * @default "unocss.css"
   */
  cssFile?: false | string;

  /**
   * A placeholder to replace with the generated CSS.
   * Only used when `cssFile` is set.
   */
  placeholder?: string;

  /**
   * Process CSS files using UnoCSS transformers.
   * @default
   * [
   *  transformerVariantGroup(),
   *  transformerDirectives()
   * ]
   */
  transformers?: SourceCodeTransformer[];

  /**
   * Supported CSS reset options.
   * @see https://github.com/unocss/unocss/tree/main/packages/reset
   * @default false
   */
  reset?: false | "tailwind" | "tailwind-compat" | "eric-meyer";
}

export const defaults: Options = {
  options: {
    presets: [presetUno()],
  },
  cssFile: "/unocss.css",
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
  ],
  reset: false,
};

/**
 * A plugin to generate CSS using UnoCSS
 * @see https://lume.land/plugins/unocss/
 */
export function unoCSS(userOptions?: Options) {
  const options = merge(defaults, userOptions);

  return (site: Site) => {
    const uno = createGenerator(options.options);
    const { transformers, cssFile, reset } = options;

    if (transformers.length > 0) {
      site.loadAssets([".css"]);
      site.process([".css"], async (files) => {
        for (const file of files) {
          if (file.content) {
            const code = new MagicString(file.content.toString());
            for await (const { transform } of transformers) {
              await transform(
                code,
                file.src.path,
                { uno } as unknown as UnocssPluginContext,
              );
            }
            file.content = code.toString();
          }
        }
      });
    }

    if (cssFile === false) {
      // Insert a <style> tag for each page
      site.process([".html"], async (pages) => {
        const resetCss = await getResetCss(reset);

        await Promise.all(pages.map(async (page) => {
          const document = page.document!;
          const result = await uno.generate(
            document.documentElement?.innerHTML ?? "",
          );
          const css = resetCss ? `${resetCss}\n${result.css}` : result.css;

          if (css) {
            const style = document.createElement("style");
            style.innerText = css;
            page.document?.head?.appendChild(style);
          }
        }));
      });
      return;
    }

    // Generate the stylesheets for all pages
    site.process([".html"], async (pages) => {
      const classes = new Set<string>();

      await Promise.all(
        pages.map(async (page) =>
          await uno.generate(
            page.document?.documentElement?.innerHTML ?? "",
          )
            .then((res) => res.matched)
            .then((matched) => matched.forEach((match) => classes.add(match)))
        ),
      );

      // Create & merge stylesheets for all pages
      const resetCss = await getResetCss(reset);
      const result = await uno.generate(classes);
      const css = resetCss ? `${resetCss}\n${result.css}` : result.css;

      // Output the CSS file
      const output = await site.getOrCreatePage(cssFile);
      insertContent(output, css, options.placeholder);
    });
  };
}

/**
 * TODO: Replace with CSS Modules Import
 * @remarks Deno does not currently support CSS Modules.
 * @see https://github.com/denoland/deno/issues/11961
 */
async function getResetCss(reset: Options["reset"]) {
  return reset === false ? "" : await read(`${resetUrl}/${reset}.css`, false);
}

export default unoCSS;
