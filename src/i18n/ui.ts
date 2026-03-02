import type { Locale } from "./locales";

type UiDictionary = Record<string, string>;

const ui: Record<Locale, UiDictionary> = {
  en: {
    home: "Home",
    experience: "Experience",
    projects: "Projects",
    training: "Training",
    cv: "CV",
    blog: "Blog",
    admin: "Admin",
    github: "GitHub",
    linkedin: "LinkedIn",
    email: "Email",
    language: "Language",
    language_en: "English",
    language_es: "Español",
    menu: "Menu",
    skip_to_content: "Skip to content",
    built_with: "Built with",
    and: "and",
    view: "View",
    read: "Read",
    more: "More",
  },
  es: {
    home: "Inicio",
    experience: "Experiencia",
    projects: "Proyectos",
    training: "Formación",
    cv: "CV",
    blog: "Blog",
    admin: "Admin",
    github: "GitHub",
    linkedin: "LinkedIn",
    email: "Correo",
    language: "Idioma",
    language_en: "English",
    language_es: "Español",
    menu: "Menú",
    skip_to_content: "Saltar al contenido",
    built_with: "Hecho con",
    and: "y",
    view: "Ver",
    read: "Leer",
    more: "Más",
  },
};

export function t(locale: Locale, key: keyof (typeof ui)["en"]): string {
  return ui[locale][key] ?? ui.en[key] ?? String(key);
}
