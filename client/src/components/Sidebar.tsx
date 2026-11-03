
import { NavLink, useLocation } from "react-router";
import { Home, ListTodo, LogOut, Palette, Plus, User, X, type LucideIcon } from "lucide-react";
import type { AuthUser } from "../types/auth";
import { FC, useEffect, useRef } from "react";


export type SidebarItem = { 
    label: string;
    to: string;
    icon: LucideIcon;
    end?: boolean
};

export type SidebarProps = {
  open: boolean;
  onClose: () => void;
  user?: AuthUser | null;
  onLogout?: () => void | Promise<void>;
  items?: SidebarItem[];
};

// Itens Padrão de Navegação
const defaultSidebarItems: SidebarItem[] = [
  { label: "Dashboard", to: "/", icon: Home },
  { label: "Nova Tarefa", to: "/create", icon: Plus },
  { label: "Tarefas", to: "/tasks", icon: ListTodo },
  { label: "Temas", to: "/settings/theme", icon: Palette },
];

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");


export const Sidebar: FC<SidebarProps> = ({ open, onClose, user, onLogout, items = defaultSidebarItems }) => {
  const location = useLocation();
  const panelRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  
  useEffect(() => {
      onCloseRef.current = onClose;
  }, [onClose]);


  // Fechar ao navegar
  useEffect(() => {
    if (open) onCloseRef.current();
  }, [location.pathname]);
  
  // Gestão de Acessibilidade (A11y)
  useEffect(() => {
    if (!open) return;

    // Guarda o elemento ativo antes de abrir o menu
    previousFocusRef.current = document.activeElement as HTMLElement;
    // Trava o scroll do body
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const getFocusable = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
      ).filter((el) => el.offsetParent !== null);

    const focusFirst = () => {
      const focusables = getFocusable();
      (focusables[0] ?? panelRef.current)?.focus();
    };

    const raf = requestAnimationFrame(focusFirst);

    // Fechar com a tecla ESC
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onCloseRef.current();
          return;
        }

        if (event.key !== "Tab") return;

        const focusables = getFocusable();
        if (focusables.length === 0) {
          event.preventDefault();
          panelRef.current?.focus();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        const inside = panelRef.current?.contains(active);

        if (event.shiftKey && (active === first || !inside)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (active === last || !inside)) {
          event.preventDefault();
          first.focus();
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        // Cleanup ao desmontar
        cancelAnimationFrame(raf);
        document.body.style.overflow = originalOverflow;
        document.removeEventListener("keydown", handleKeyDown);
        previousFocusRef.current?.focus();
      };
    }, [open]);

  return (
    <>
      {open && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        ref={panelRef}
        id="app-sidebar"
        role="dialog"
        aria-modal={open}
        aria-label="Menu lateral"
        aria-hidden={!open}
        inert={!open}
        tabIndex={-1}
        className={`fixed top-0 left-0 z-50 flex h-full w-64 max-w-[85vw] flex-col bg-base-100 shadow-xl outline-none transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="avatar placeholder">
              <div className="w-10 rounded-full bg-neutral text-neutral-content">
                <span className="text-lg font-semibold uppercase">
                  {user?.name ? user.name.charAt(0) : <User className="h-5 w-5" />}
                </span>
              </div>
            </div>
            <div className="flex min-w-0 flex-col overflow-hidden">
              <span className="truncate font-bold text-base-content">
                {user?.name || "Visitante"}
              </span>
              {user?.email && (
                <span className="truncate text-xs text-base-content/70">
                  {user.email}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            aria-label="Fechar menu"
            onClick={onClose}
            className="btn btn-ghost btn-square btn-sm"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="divider my-0 px-4" />

        <nav className="flex-1 overflow-y-auto">
          <ul className="menu gap-1 p-4 text-base-content">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end ?? item.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {onLogout && (
          <div className="border-t border-base-200 p-4">
            <ul className="menu p-0">
              <li>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await onLogout();
                    } finally {
                      onClose();
                    }
                  }}
                  className="text-error hover:bg-error/10 hover:text-error"
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </button>
              </li>
            </ul>
          </div>
        )}
      </aside>
    </>
  );
};