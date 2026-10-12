import { redirect } from "next/navigation";

export default function AuthorIndexPage() {
  redirect("/blog");
}
