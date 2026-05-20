import { redirect } from 'next/navigation'

export default async function Redirect({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  redirect(`/${locale}/admin/kunjungan/kegiatan/${id}`)
}
