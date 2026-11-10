
import { NavLink, useLocation } from "react-router";
import { Home, ListTodo, LogOut, Palette, Plus, User, X, type LucideIcon } from "lucide-react";
import type { AuthUser } from "@/types/auth";
import { type FC, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent, useEffect, useRef } from "react";


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

  const SWIPE_CLOSE_THRESHOLD = 64; // px
  const SWIPE_DEAD_ZONE = 10; // px
  const SIDEBAR_TRANSITION_MS = 300;

  const panelWidthRef = useRef(0);
  const animationTimeoutRef = useRef<number | null>(null);
  const backdropRef = useRef<HTMLButtonElement | null>(null);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef(false);
  const suppressClickRef = useRef(false);

  // Helpers de estilo
  const clearPanelInlineStyles = () => {
    const panel = panelRef.current;
    if (!panel) return;

    panel.style.transition = "";
    panel.style.willChange = "";
    
    void panel.offsetWidth;   // registra a transição antes de remover o transform
    panel.style.transform = "";
  };
  const setPanelDragPosition = (x: number) => {
    const panel = panelRef.current;
    if (!panel) return;

    panel.style.transition = "none";
    panel.style.willChange = "transform";
    panel.style.transform = `translate3d(${x}px, 0, 0)`;
  };
  const animatePanelTo = (targetX: number, shouldClose: boolean) => {
    const panel = panelRef.current;
    if (!panel) {
      if (shouldClose) onCloseRef.current();
      return;
    }
    // Cleanup Timeout
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      if (shouldClose) {
        onCloseRef.current(); // Efeito Open - limpa o inline
      } else {
        clearPanelInlineStyles();
      }
      return;
    }
    
    panel.style.transition = `transform ${SIDEBAR_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    panel.style.willChange = "transform";
  
    void panel.offsetWidth;
    panel.style.transform = `translate3d(${targetX}px, 0, 0)`;

    if (backdropRef.current) {
      backdropRef.current.style.opacity = shouldClose ? "0" : "1";
    }
    // Cleanup Timeout
    animationTimeoutRef.current = window.setTimeout(() => {
      animationTimeoutRef.current = null;

      if (shouldClose) {
        onCloseRef.current(); // Efeito Open - limpa o inline
      } else {
        clearPanelInlineStyles();
      }
    }, SIDEBAR_TRANSITION_MS + 20);
  };

  
  const resetSwipeRefs = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchEndXRef.current = null;
    isHorizontalSwipeRef.current = false;
  };

  //  Mede a largura, cancela animação pendente, limpa estilos inline e guarda as coordenadas
  const handleTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    const wasHorizontal = isHorizontalSwipeRef.current;
    resetSwipeRefs();

    if (!open) return;

    if (event.touches.length !== 1) {
      // Segundo dedo: cancela o drag e volta para a posição aberta
      if (wasHorizontal) animatePanelTo(0, false);
      return;
    }
    const panel = panelRef.current;
    panelWidthRef.current = panel?.getBoundingClientRect().width ?? 0;

    // Cleanup Timeout
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    clearPanelInlineStyles();

    if (backdropRef.current) {
      backdropRef.current.style.opacity = "1";
    }

    const touch = event.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchEndXRef.current = touch.clientX;
  };

  // Mantém o Axis Lock, Ao confirmar Swipe, Atualiza o transform em todo movimento
  const handleTouchMove = (event: ReactTouchEvent<HTMLElement>) => {
    if (!open || touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }
    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    touchEndXRef.current = touch.clientX;

    if (!isHorizontalSwipeRef.current) {
      const deltaX = touch.clientX - touchStartXRef.current;
      const deltaY = touch.clientY - touchStartYRef.current;

      // Dead zone: evita fechar com um toque trêmulo
      if (Math.abs(deltaX) < SWIPE_DEAD_ZONE) return;
      // Se o movimento vertical domina, deixa o scroll da nav acontecer
      if (Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
      // Só interessa arrastar para a esquerda (drawer está à esquerda)
      if (deltaX >= 0) return;

      isHorizontalSwipeRef.current = true;
      suppressClickRef.current = true;
    }

    const deltaX = touch.clientX - touchStartXRef.current;
    const width = panelWidthRef.current || panelRef.current?.offsetWidth || window.innerWidth * 0.85;
    const clampedX = Math.min(0, Math.max(-width, deltaX));

    setPanelDragPosition(clampedX);

    if (backdropRef.current && width > 0) {
      const progress = 1 - Math.abs(clampedX) / width;
      backdropRef.current.style.opacity = String(progress);
    }
  };

  // Contém X inicial e final, calcula o limiar e anima área fechar ou voltar
  const handleTouchEnd = (event: ReactTouchEvent<HTMLElement>) => {
    const touch = event.changedTouches[0];
    if (touch) touchEndXRef.current = touch.clientX;

    const startX = touchStartXRef.current;
    const endX = touchEndXRef.current;
    const wasHorizontal = isHorizontalSwipeRef.current;
    const width = panelWidthRef.current || panelRef.current?.offsetWidth || window.innerWidth * 0.85;

    resetSwipeRefs();

    if (wasHorizontal) {
      // O click sintético dispara logo após o touchend; libera depois
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 350);
    }

    if (!open || !wasHorizontal || startX === null || endX === null) {
      clearPanelInlineStyles();
      return;
    }

    const deltaX = endX - startX;
    const threshold = Math.max(SWIPE_CLOSE_THRESHOLD, width * 0.25);
    const shouldClose = deltaX <= -threshold;

    animatePanelTo(shouldClose ? -width : 0, shouldClose);
  };

  // Cancelamento de Toque
  const handleTouchCancel = () => {
    const wasHorizontal = isHorizontalSwipeRef.current;
    resetSwipeRefs();
    suppressClickRef.current = false;

    if (wasHorizontal && open) {
      animatePanelTo(0, false);
    } else {
      clearPanelInlineStyles();
    }
  };

  // Captura de Toque
  const handleClickCapture = (event: ReactMouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (open) {
      clearPanelInlineStyles();
      return;
    }

    const raf = requestAnimationFrame(() => {
      clearPanelInlineStyles();
    });

    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Cleanup Unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

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
          ref={backdropRef}
          type="button"
          tabIndex={-1}
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onClickCapture={handleClickCapture}
        className={`fixed top-0 left-0 z-50 flex h-full w-64 max-w-[85vw] flex-col bg-base-100 shadow-xl outline-none touch-pan-y overscroll-x-contain transition-transform duration-300 motion-reduce:transition-none ${
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