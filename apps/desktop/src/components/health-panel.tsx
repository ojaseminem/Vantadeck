import { useEffect, useState } from "react";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadDismissedHealth, saveDismissedHealth } from "../lib/local-store";
import type { HealthIssue } from "../bridge";

/** Renders a project's health issues with per-issue dismiss/hide, persisted per
 *  project. Hidden issues can be revealed again from here. */
export function HealthPanel({ projectPath, issues, emptyText }: { projectPath: string; issues: HealthIssue[]; emptyText?: string }) {
  const [dismissed, setDismissed] = useState<string[]>(() => loadDismissedHealth(projectPath));
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => setDismissed(loadDismissedHealth(projectPath)), [projectPath]);

  function toggle(code: string) {
    const next = dismissed.includes(code) ? dismissed.filter((value) => value !== code) : [...dismissed, code];
    setDismissed(next);
    saveDismissedHealth(projectPath, next);
  }

  const hiddenCount = issues.filter((issue) => dismissed.includes(issue.code)).length;
  const visible = issues.filter((issue) => showHidden || !dismissed.includes(issue.code));

  if (issues.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText ?? "No health issues. Everything looks good."}</p>;
  }

  return (
    <div className="space-y-2">
      {hiddenCount > 0 ? (
        <button onClick={() => setShowHidden((value) => !value)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          {showHidden ? <EyeOff size={13} /> : <Eye size={13} />}
          {showHidden ? "Hide dismissed" : `Show ${hiddenCount} dismissed`}
        </button>
      ) : null}
      {visible.map((issue) => {
        const isHidden = dismissed.includes(issue.code);
        return (
          <div key={issue.code} className={cn("flex items-start gap-2.5 rounded-lg border border-border p-3", isHidden && "opacity-60")}>
            <CircleAlert size={16} className={cn("mt-0.5 shrink-0", issue.severity === "error" ? "text-destructive" : "text-primary")} />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium">{issue.title}</h4>
              <p className="text-sm text-muted-foreground">{issue.detail}</p>
              {issue.remediation ? <p className="mt-1 text-xs text-muted-foreground"><span className="text-foreground">Fix:</span> {issue.remediation}</p> : null}
              <small className="text-[10px] uppercase tracking-wide text-muted-foreground">{issue.code}</small>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground" onClick={() => toggle(issue.code)}>
              {isHidden ? "Unhide" : "Dismiss"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
