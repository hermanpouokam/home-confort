import { getRequestConfig } from "next-intl/server";

const locales = ["fr", "en"];

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = locales.includes(requested as string) ? (requested as string) : "fr";

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});