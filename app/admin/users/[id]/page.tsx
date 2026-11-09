import UsersPage from "@/components/admin/users-page";
export const metadata = { title: "Member details" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UsersPage id={id} />;
}
