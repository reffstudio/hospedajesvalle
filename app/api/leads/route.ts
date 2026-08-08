import { NextResponse } from "next/server"
import { PUBLIC_API_ERRORS, logServerError } from "@/lib/api/errors"
import { validatePreReservationLeadInput } from "@/lib/pre-reservation/validate-lead-input"
import { insertPreReservationLead } from "@/lib/supabase/queries/leads.server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = validatePreReservationLeadInput(body)

    if (!validated.ok) {
      return NextResponse.json({ ok: false, error: validated.error }, { status: 400 })
    }

    const result = await insertPreReservationLead(validated.value)
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  } catch (error) {
    logServerError("api/leads", error)
    return NextResponse.json({ ok: false, error: PUBLIC_API_ERRORS.submitFailed }, { status: 500 })
  }
}
