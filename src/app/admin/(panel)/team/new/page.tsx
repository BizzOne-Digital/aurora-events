import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/session";
import { saveTeamMember } from "../actions";
import { TEAM_FIELDS } from "../fields";

export const metadata: Metadata = { title: "Add team member" };

export default async function NewTeamMemberPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add team member" />
      <EntityForm
        fields={TEAM_FIELDS}
        initial={{ name: "", role: "", bio: "", photo: null, visible: false }}
        action={saveTeamMember.bind(null, null)}
        submitLabel="Create team member"
        cancelHref="/admin/team"
      />
    </>
  );
}
