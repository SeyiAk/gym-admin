import { MapPinOff } from "lucide-react";
import { EmptyState } from "./EmptyState";

/** Shown to branch-only roles when no branch could be resolved (see useScope). */
export function ScopeNotice({ error }: { error?: Error | null }) {
  return (
    <div className="card">
      <EmptyState
        icon={MapPinOff}
        header="No branch selected"
        subHeader={
          error
            ? `We couldn't load your branches: ${error.message}`
            : "Your account isn't linked to a branch yet. Ask your gym owner to assign you to one."
        }
      />
    </div>
  );
}
