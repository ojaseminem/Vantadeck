import { useState } from "react";
import { Activity, ChevronDown, ChevronRight, Folder, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HealthPanel } from "./health-panel";
import { desktopApi, isNativeRuntime, type HealthIssue, type RegisteredProject } from "../bridge";

export function HealthScreen({ projects, onOpenProject }: { projects: RegisteredProject[]; onOpenProject: (project: { path: string; name: string }) => void }) {
  const [results, setResults] = useState<Record<string, HealthIssue[]>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checkingAll, setCheckingAll] = useState(false);

  async function runOne(path: string, expand = true) {
    if (!isNativeRuntime()) return;
    setLoading(path);
    try {
      const issues = await desktopApi.projectHealth(path);
      setResults((current) => ({ ...current, [path]: issues }));
      if (expand) setExpanded(path);
    } finally {
      setLoading(null);
    }
  }

  async function checkAll() {
    setCheckingAll(true);
    try {
      for (const project of projects) {
        await runOne(project.path, false);
      }
    } finally {
      setCheckingAll(false);
    }
  }

  const counts = (issues: HealthIssue[]) => ({
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity !== "error").length,
  });

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div><div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace</div><h1 className="text-2xl font-semibold">Health</h1></div>
        <Button variant="outline" disabled={checkingAll || !projects.length || !isNativeRuntime()} onClick={() => void checkAll()}>
          {checkingAll ? <><RefreshCw size={15} className="animate-spin" /> Checking all…</> : <><Activity size={15} /> Check all projects</>}
        </Button>
      </div>

      {projects.length === 0 ? <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">No projects registered yet. Import a project to track its health.</p></CardContent></Card> : null}

      <div className="space-y-3">
        {projects.map((project) => {
          const issues = results[project.path];
          const isExpanded = expanded === project.path;
          const tally = issues ? counts(issues) : null;
          return (
            <Card key={project.path}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => setExpanded(isExpanded ? null : project.path)}>
                    {isExpanded ? <ChevronDown size={16} className="shrink-0 text-muted-foreground" /> : <ChevronRight size={16} className="shrink-0 text-muted-foreground" />}
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary"><Folder size={17} /></span>
                    <span className="min-w-0 flex-1"><strong className="block truncate font-medium">{project.name}</strong><small className="block truncate text-xs text-muted-foreground">{project.path}</small></span>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    {tally ? (
                      tally.errors === 0 && tally.warnings === 0
                        ? <Badge variant="secondary" className="text-primary">Healthy</Badge>
                        : <>{tally.errors ? <Badge variant="outline" className="border-destructive/50 text-destructive">{tally.errors} error{tally.errors > 1 ? "s" : ""}</Badge> : null}{tally.warnings ? <Badge variant="outline">{tally.warnings} warning{tally.warnings > 1 ? "s" : ""}</Badge> : null}</>
                    ) : <span className="text-xs text-muted-foreground">Not checked</span>}
                    <Button variant="outline" size="sm" disabled={loading === project.path || !isNativeRuntime()} onClick={() => void runOne(project.path)}>{loading === project.path ? <RefreshCw size={14} className="animate-spin" /> : issues ? "Re-check" : "Run checks"}</Button>
                    <Button variant="ghost" size="sm" onClick={() => onOpenProject({ path: project.path, name: project.name })}>Open</Button>
                  </div>
                </div>
                {isExpanded && issues ? <div className="mt-3 border-t border-border pt-3"><HealthPanel projectPath={project.path} issues={issues} /></div> : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
