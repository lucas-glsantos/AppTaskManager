import { Check, Droplets, Moon, Palette, Sun, Trees, type LucideIcon } from "lucide-react";
import { THEMES, useTheme, type Theme } from "../../context/ThemeContext";
import { THEME_OPTIONS } from "../../lib/themes";

const ThemeSettingsPage = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto mt-6 w-full max-w-5xl p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-base-content">
          Configurações de tema
        </h1>
        <p className="mt-1 text-sm text-base-content/70">
          Escolha o tema da interface que preferir no seu navegador.
        </p>
      </header>

      <fieldset>
        <legend className="sr-only">Tema da interface</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_OPTIONS.map((option) => {
            const {id , label, description, icon: Icon } = option;
            const selected = id === theme;

            return (
              <label
                key={id}
                className={`card cursor-pointer border-2 bg-base-100 transition focus-within:ring-2 focus-within:ring-primary ${
                  selected
                    ? "border-primary"
                    : "border-base-300 hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={id}
                  checked={selected}
                  onChange={() => setTheme(id)}
                  aria-label={label}
                  className="sr-only"
                />

                <div className="card-body gap-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold">
                      <Icon className="h-5 w-5 text-primary" />
                      {label}
                    </span>
                    {selected && <Check className="h-5 w-5 text-primary" />}
                  </div>

                  <div
                    data-theme={id}
                    className="rounded-box border border-base-300 bg-base-100 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-primary" />
                      <span className="h-3 w-3 rounded-full bg-secondary" />
                      <span className="h-3 w-3 rounded-full bg-accent" />
                    </div>
                    <div className="mt-3 h-2 w-3/4 rounded bg-base-content/20" />
                    <div className="mt-2 h-2 w-1/2 rounded bg-base-content/10" />
                  </div>

                  <p className="text-xs leading-relaxed text-base-content">
                    {description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};

export default ThemeSettingsPage;