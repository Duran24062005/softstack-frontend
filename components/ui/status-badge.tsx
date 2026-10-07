import { Archive, CheckCircle, PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";

export type ContentStatus = "draft" | "published" | "archived";

const statusConfig = {
  draft: { label: "Borrador", icon: PencilSimpleLine },
  published: { label: "Publicado", icon: CheckCircle },
  archived: { label: "Archivado", icon: Archive },
} as const;

export function StatusBadge({ status }: { status: ContentStatus }) {
  const { label, icon: Icon } = statusConfig[status];

  return (
    <span className={`status-badge status-badge-${status}`}>
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  );
}
