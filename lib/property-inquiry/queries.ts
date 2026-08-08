import type { PropertyInquiryInput } from "@/lib/property-inquiry/types"

export async function submitPropertyInquiry(
  input: PropertyInquiryInput,
): Promise<{ ok: true; id: string; emailSent?: boolean } | { ok: false; error: string }> {
  const response = await fetch("/api/property-inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const payload = (await response.json()) as
    | { ok: true; id: string; emailSent?: boolean }
    | { ok: false; error: string }

  return payload
}
