import { NextResponse } from "next/server"
import { validatePropertyInquiryInput } from "@/lib/property-inquiry/validate-input"
import { insertPropertyInquiryLead } from "@/lib/supabase/queries/property-inquiries.server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = validatePropertyInquiryInput(body)

    if (!validated.ok) {
      return NextResponse.json({ ok: false, error: validated.error }, { status: 400 })
    }

    const result = await insertPropertyInquiryLead(validated.value)
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit inquiry."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
