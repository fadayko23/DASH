import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8">DASH</h1>
      <div className="flex gap-4">
        <Link href="/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Go to Login
        </Link>
         <Link href="/dashboard" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
            Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
