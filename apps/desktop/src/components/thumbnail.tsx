import { useEffect, useState } from "react";
import { Box } from "lucide-react";
import { desktopApi, isNativeRuntime } from "../bridge";
import { cn } from "@/lib/utils";

/// Loads a project's team-shared thumbnail (stored project-relative in
/// project.toml) as a data URL, or null when there is none.
function useThumbnailUrl(projectPath: string, thumbnail?: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (thumbnail && isNativeRuntime()) {
      desktopApi
        .readImage(`${projectPath}/${thumbnail}`)
        .then((value) => { if (active) setUrl(value); })
        .catch(() => undefined);
    } else {
      setUrl(null);
    }
    return () => { active = false; };
  }, [projectPath, thumbnail]);
  return url;
}

/// A square project thumbnail that falls back to a neutral icon tile.
export function ProjectThumb({ projectPath, thumbnail, className, iconSize = 18, alt }: {
  projectPath: string;
  thumbnail?: string | null;
  className?: string;
  iconSize?: number;
  alt?: string;
}) {
  const url = useThumbnailUrl(projectPath, thumbnail);
  return (
    <span className={cn("flex items-center justify-center overflow-hidden rounded-lg bg-secondary text-primary", className)}>
      {url ? <img src={url} alt={alt ?? ""} className="h-full w-full object-cover" /> : <Box size={iconSize} />}
    </span>
  );
}
