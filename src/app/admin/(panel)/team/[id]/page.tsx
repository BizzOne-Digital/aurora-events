import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { connectDB } from "@/lib/db";
import { TeamModel } from "@/lib/models";
import { requireAdmin } from "@/lib/session";
import { saveTeamMember } from "../actions";
import { TEAM_FIELDS } from "../fields";

export const metadata: Metadata = { title: "Edit team member" };

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const m = await TeamModel.findById(id).lean();
  if (!m) notFound();
  return (
    <>
      <PageHeader title={`Edit: ${m.name}`} subtitle={m.isDemo ? "This is demo content. Replace it with a real team member before showing it." : undefined} />
      <EntityForm
        fields={TEAM_FIELDS}
        initial={{
          name: m.name,
          role: m.role,
          bio: m.bio ?? "",
          photo: m.photo?.url ? { url: m.photo.url, alt: m.photo.alt ?? "", publicId: m.photo.publicId ?? "" } : null,
          visible: m.visible,
        }}
        action={saveTeamMember.bind(null, id)}
        submitLabel="Save changes"
        cancelHref="/admin/team"
      />
    </>
  );
}
