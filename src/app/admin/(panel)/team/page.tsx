import type { Metadata } from "next";
import { RowActions } from "@/components/admin/row-actions";
import { Badge, EmptyRow, PageHeader, Pager, Thumb } from "@/components/admin/ui";
import { pageParam } from "@/lib/admin-crud";
import { connectDB } from "@/lib/db";
import { TeamModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { deleteTeamMember, moveTeamMember, toggleTeamMember } from "./actions";

export const metadata: Metadata = { title: "Team" };
const PAGE_SIZE = 10;

export default async function TeamAdminPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  await connectDB();
  const page = pageParam((await searchParams).page);
  const [total, rows] = await Promise.all([
    TeamModel.countDocuments(),
    TeamModel.find()
      .sort({ order: 1, createdAt: 1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);
  return (
    <>
      <PageHeader title="Team" subtitle="Real team members only. Hidden members never appear on the public site." action={{ href: "/admin/team/new", label: "Add team member" }} />
      {rows.length === 0 ? (
        <EmptyRow title="No team members yet" text="The public Our Team page shows an elegant empty state until you add and show real team members." />
      ) : (
        <ul className="space-y-3">
          {rows.map((m) => (
            <li key={String(m._id)} className="adm-card flex flex-wrap items-center gap-4 p-4">
              <Thumb url={m.photo?.url} alt={m.photo?.alt ?? ""} />
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate font-bold">{m.name}</p>
                <p className="truncate text-sm text-[#5a4768]">{m.role}</p>
                <div className="mt-1.5 flex gap-2">
                  <Badge>{m.visible ? "Visible" : "Hidden"}</Badge>
                  {m.isDemo && <span className="adm-badge bg-[#fff0d6] text-[#7a5200]">Demo content</span>}
                </div>
              </div>
              <RowActions
                id={String(m._id)}
                itemName={m.name}
                editHref={`/admin/team/${m._id}`}
                published={m.visible}
                publishLabels={["Show", "Hide"]}
                onToggle={toggleTeamMember}
                onMove={moveTeamMember}
                onDelete={deleteTeamMember}
              />
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} total={total} pageSize={PAGE_SIZE} basePath="/admin/team" />
    </>
  );
}
