import { useEffect, useState } from "react";

export type ThemePreference = "system" | "dark" | "light";
export type ResolvedTheme = "dark" | "light";

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  return preference === "system"
    ? systemPrefersDark
      ? "dark"
      : "light"
    : preference;
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem("vantadeck.theme");
    return stored === "dark" || stored === "light" || stored === "system"
      ? stored
      : "system";
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = resolveTheme(preference, media.matches);
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };
    apply();
    media.addEventListener("change", apply);
    localStorage.setItem("vantadeck.theme", preference);
    return () => media.removeEventListener("change", apply);
  }, [preference]);

  return { preference, setPreference };
}
