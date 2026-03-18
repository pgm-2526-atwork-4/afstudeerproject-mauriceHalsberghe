import { API_URL } from "@/lib/api";
import UserRecipesClient from "@/app/components/UserRecipesClient";

export async function generateStaticParams() {
  const res = await fetch(`${API_URL}/api/users/usernames`);
  const usernames: string[] = await res.json();

  return usernames.map((username) => ({ username }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <UserRecipesClient username={username} />;
}
