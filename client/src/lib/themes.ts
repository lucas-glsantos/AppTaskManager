import { Droplets, Moon, Palette, Sun, Trees, type LucideIcon } from "lucide-react";

export type ThemeOption = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const THEME_OPTIONS = [
  {
    id: "light",
    label: "Claro",
    description:
      "Tema light: Base clara com texto escuro e alto contraste. A secundária rosa é o ponto de atenção.",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Escuro",
    description:
      "Tema dark: Base escura com texto claro e acentos violeta, rosa e ciano.",
    icon: Moon,
  },
  {
    id: "dim",
    label: "Dim",
    description:
      "Base cinza-azulada mais clara que a do tema escuro e acentos pastel; o contraste medido é alto apesar da aparência suavizada.",
    icon: Palette,
  },
  {
    id: "forest",
    label: "Forest",
    description:
      "Tema escuro terroso: base verde-carvo, texto claro e acentos verde, teal e ciano. Contraste alto e uniforme.",
    icon: Trees,
  },
  {
    id: "aqua",
    label: "Aqua",
    description:
      "Tema escuro azul-violeta: texto quase branco e acentos ciano, lavanda e limão. A base/texto é o menor contraste do conjunto.",
    icon: Droplets,
  },
] as const satisfies readonly ThemeOption[];

export type Theme = (typeof THEME_OPTIONS)[number]["id"];

export const THEMES: readonly Theme[] = THEME_OPTIONS.map((option) => option.id);
export const DEFAULT_THEME: Theme = "light";

export function isTheme(value: string | null): value is Theme {
  return value !== null && (THEMES as readonly string[]).includes(value);
}