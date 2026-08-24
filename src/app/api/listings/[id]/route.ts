import { NextResponse } from "next/server";
import { deleteListing, updateListingUser } from "@/lib/listings-store";
import { STATUSES } from "@/lib/types";
import type { EditableUserFields } from "@/lib/types";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/listings/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();

  const fields: EditableUserFields = {};
  if (typeof body.favorite === "boolean") fields.favorite = body.favorite;
  if (typeof body.notes === "string" || body.notes === null) fields.notes = body.notes;
  if (typeof body.status === "string") {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    fields.status = body.status;
  }

  const updated = await updateListingUser(id, fields);
  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/listings/[id]">,
) {
  const { id } = await ctx.params;
  const ok = await deleteListing(id);
  if (!ok) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
