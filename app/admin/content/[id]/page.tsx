import ContentPage from "@/components/admin/content-page";
export const metadata = { title: "Post details" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContentPage id={id} />;
}
