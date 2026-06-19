import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import InstallPrompt from '@/components/ui/InstallPrompt'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-bg pb-20">
      <InstallPrompt />
      {children}
      <BottomNav />
    </div>
  )
}
