import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/shared/Avatar";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { Member, Pagination } from "@/types";
import { display, formatDate, fullName, titleCase } from "@/utils/helper";
import { statusTone } from "./constants";

type Props = {
  members: Member[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  emptyState: { header: string; subHeader?: string };
  showBranch: boolean;
};

export function MembersTable({
  members,
  showBranch,
  pagination,
  onPageChange,
  onPageSizeChange,
  ...rest
}: Props) {
  const navigate = useNavigate();
  const columns: ColumnDef<Member, unknown>[] = [
    {
      header: "Member",
      id: "member",
      cell: ({ row }) => {
        const name = fullName(row.original);
        return (
          <div className="flex items-center gap-3">
            <Avatar name={name} src={row.original.profileImage} />
            <div className="flex flex-col">
              <span className="font-semibold text-white">{name}</span>
              <span className="text-sm text-subtle">{row.original.membershipNumber}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: ({ getValue }) => <span className="text-muted">{display(getValue())}</span>,
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: ({ getValue }) => <span className="text-muted">{display(getValue())}</span>,
    },
    ...(showBranch
      ? [
          {
            header: "Branch",
            id: "branch",
            cell: ({ row }) => (
              <span className="text-muted">{display(row.original.homeBranch?.name)}</span>
            ),
          } as ColumnDef<Member, unknown>,
        ]
      : []),
    {
      header: "Plan",
      id: "plan",
      cell: ({ row }) =>
        row.original.currentMembership ? (
          <span className="text-appPrimary">{row.original.currentMembership.plan.name}</span>
        ) : (
          <span className="text-subtle">No active plan</span>
        ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => (
        <StatusBadge tone={statusTone(getValue<string>())}>
          {titleCase(getValue<string>())}
        </StatusBadge>
      ),
    },
    {
      header: "Joined",
      accessorKey: "joinedAt",
      cell: ({ getValue }) => <span className="text-muted">{formatDate(getValue<string>())}</span>,
    },
    {
      header: "Actions",
      id: "actions",
      // Edit and delete appear in the design but have no endpoints yet; see docs/API_NOTES.md.
      cell: ({ row }) => (
        <Button
          variant="secondary"
          size="icon"
          aria-label={`View ${fullName(row.original)}`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/members/${row.original.id}`);
          }}
        >
          <Eye />
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={members}
      onRowClick={(m) => navigate(`/members/${m.id}`)}
      pagination={{
        page: pagination.page,
        pageSize: pagination.limit,
        totalPages: pagination.totalPages,
        total: pagination.total,
        onPageChange,
        onPageSizeChange,
      }}
      {...rest}
    />
  );
}
