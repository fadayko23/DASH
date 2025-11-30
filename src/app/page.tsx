import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#FAFAFA] text-foreground">
      <h1 className="text-5xl font-semibold mb-8 tracking-tight">DASH<span className="text-primary">.</span></h1>
      <div className="flex gap-3">
        <Link href="/login" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
            Go to Login
        </Link>
         <Link href="/dashboard" className="px-5 py-2.5 bg-white border border-[#E8E8E8] text-foreground rounded-md hover:bg-[#F7F7F7] transition-colors text-sm font-medium">
            Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
