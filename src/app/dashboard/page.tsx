import { auth } from "@/auth"
import { getCurrentTenant } from "@/lib/tenant"
import { DataCard } from "@/components/ui/data-card"
import { FaProjectDiagram, FaClock, FaThList, FaFileInvoiceDollar, FaUserFriends, FaArrowRight, FaExternalLinkAlt, FaCalendarCheck } from "react-icons/fa"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  const tenant = await getCurrentTenant()

  return (
    <div className="min-h-full p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 py-8">
        <div className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">Welcome To</div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground">
          {tenant?.name || 'DASH'}<span className="text-primary">.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Overview Section */}
          <section>
             <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 bg-foreground text-background flex items-center justify-center text-2xl font-bold rounded-sm">
                    {tenant?.name?.substring(0, 2) || 'JL'}
                </div>
                <h2 className="text-3xl font-bold">Overview</h2>
             </div>
             <p className="text-lg text-muted-foreground leading-relaxed">
                An all-in-one project management and design dashboard. 
                <span className="font-semibold text-foreground"> {tenant?.name || 'DASH'} </span>
                provides seamless access to every phase of your project—whether you're managing clients, tracking tasks, or finalizing selections for interiors and exteriors. 
                From finishes and fixtures to furnishings and on-the-go resources, this hub allows for organized, intuitive project oversight.
             </p>
          </section>

          {/* Projects Section */}
          <section className="space-y-6">
              <h3 className="text-xl font-bold">Projects</h3>
              <p className="text-muted-foreground">Effortlessly explore the different stages of your ongoing and past projects.</p>
              
              <div className="space-y-4">
                  <DataCard 
                    title="All Projects" 
                    subtext="Dive into all the projects that are full steam ahead. Stay on top of everything that's in motion."
                    href="/dashboard/projects"
                    icon={<FaProjectDiagram />}
                    className="bg-card hover:bg-accent/50"
                  />
                  <DataCard 
                    title="Project Hours" 
                    subtext="View hours utilized and stay up to date with project hours."
                    href="/dashboard/projects" // Ideally links to specific hours view
                    icon={<FaClock />}
                  />
                  <DataCard 
                    title="Selection List" 
                    subtext="Easily access and review all chosen materials, finishes, and design elements for your project."
                    href="/dashboard/inventory"
                    icon={<FaThList />}
                  />
                  <DataCard 
                    title="Change Orders" 
                    subtext="Stay on top of any adjustments to project details with clear documentation of all change orders."
                    href="/dashboard/projects"
                    icon={<FaFileInvoiceDollar />}
                  />
              </div>
          </section>
          
          {/* Clients Section */}
          <section className="space-y-6">
              <h3 className="text-xl font-bold">Clients</h3>
              <p className="text-muted-foreground">Seamlessly access information about your current and former clients.</p>
              <DataCard 
                title="All Clients" 
                subtext="Stay connected with clients who are currently or have been on their design journey."
                href="/dashboard/clients"
                icon={<FaUserFriends />}
              />
          </section>

        </div>

        {/* Right Sidebar Column */}
        <aside className="space-y-10">
            
            {/* About Section */}
            <div className="bg-card p-8 rounded-xl border shadow-sm space-y-6">
                <h3 className="text-xl font-bold">About {tenant?.name || 'Designer'}</h3>
                <p className="text-sm text-muted-foreground">
                    {tenant?.name || 'JL Coates Interior Design Studio'} is an award-winning design studio.
                </p>
                
                <div className="space-y-3 pt-2">
                    <a href="#" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                        <FaExternalLinkAlt className="text-xs" /> {tenant?.name || 'Designer'} Website
                    </a>
                    <a href="#" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                        <FaExternalLinkAlt className="text-xs" /> Interior Design Style Quiz
                    </a>
                    <a href="#" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                        <FaExternalLinkAlt className="text-xs" /> Style Quiz Results
                    </a>
                </div>
            </div>

            {/* Schedule Section */}
            <div className="bg-card p-8 rounded-xl border shadow-sm space-y-6">
                <h3 className="text-xl font-bold">Schedule</h3>
                <p className="text-sm text-muted-foreground">
                    Plan your next step with {tenant?.name || 'us'}.
                </p>
                
                <div className="space-y-4 pt-2">
                    <Link href="/dashboard/meetings/book" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                        <FaCalendarCheck /> Schedule Discover Call
                    </Link>
                    <Link href="/dashboard/meetings/book" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                        <FaCalendarCheck /> Schedule Site Visit
                    </Link>
                    <Link href="/dashboard/meetings/book" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                        <FaCalendarCheck /> Schedule Kick-Off
                    </Link>
                </div>
            </div>
            
             {/* Designer In Mind Section */}
             <div className="bg-card p-8 rounded-xl border shadow-sm space-y-6">
                <h3 className="text-xl font-bold">About Designer In Mind</h3>
                <p className="text-sm text-muted-foreground">
                    Designer In Mind is a platform tailored specifically for the Interior Design Studio.
                </p>
                <div className="space-y-3 pt-2">
                    <a href="#" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                        <FaExternalLinkAlt className="text-xs" /> Designer In Mind Website
                    </a>
                </div>
            </div>

        </aside>
      </div>
    </div>
  )
}
