import { redirect } from "next/navigation";

export default function FindEventPage() {
  redirect("/auth?tab=find-event");
}
