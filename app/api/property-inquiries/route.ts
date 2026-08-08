import { NextResponse } from "next/server"
import { PUBLIC_API_ERRORS, logServerError } from "@/lib/api/errors"
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
    logServerError("api/property-inquiries", error)
    return NextResponse.json({ ok: false, error: PUBLIC_API_ERRORS.submitFailed }, { status: 500 })
  }
}
