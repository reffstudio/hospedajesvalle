import { PropertyForm } from "@/components/dashboard/property-form"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DashboardEditPropertyPage({ params }: PageProps) {
  const { id } = await params
  return <PropertyForm mode="edit" propertyId={id} />
}
