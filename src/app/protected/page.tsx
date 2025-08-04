
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { InfoIcon } from "lucide-react"
import DashboardPage from "@/components/dashboard/dashboard-page"
export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto p-4">
      <DashboardPage />
    </div>
  )
}
