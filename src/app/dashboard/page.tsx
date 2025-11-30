import { auth } from "@/auth"
import { getCurrentTenant } from "@/lib/tenant"
import { DataCard } from "@/components/ui/data-card"
import { FaProjectDiagram, FaClock, FaThList, FaFileInvoiceDollar, FaUserFriends, FaArrowRight, FaExternalLinkAlt, FaCalendarCheck } from "react-icons/fa"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  const tenant = await getCurrentTenant()

  return (
    <div className="min-h-full p-8 md:p-10 max-w-7xl mx-auto space-y-10">
      
      {/* Hero Header */}
      <div className="space-y-3 py-6">
        <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Welcome To</div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
          {tenant?.name || 'DASH'}<span className="text-primary">.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Overview Section */}
          <section>
             <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold rounded-md">
                    {tenant?.name?.substring(0, 2) || 'JL'}
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Overview</h2>
             </div>
             <p className="text-base text-muted-foreground leading-relaxed">
                An all-in-one project management and design dashboard. 
                <span className="font-medium text-foreground"> {tenant?.name || 'DASH'} </span>
                provides seamless access to every phase of your project—whether you're managing clients, tracking tasks, or finalizing selections for interiors and exteriors. 
                From finishes and fixtures to furnishings and on-the-go resources, this hub allows for organized, intuitive project oversight.
             </p>
          </section>

          {/* Projects Section */}
          <section className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Projects</h3>
                <p className="text-sm text-muted-foreground">Effortlessly explore the different stages of your ongoing and past projects.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataCard 
                    title="All Projects" 
                    subtext="Dive into all the projects that are full steam ahead. Stay on top of everything that's in motion."
                    href="/dashboard/projects"
                    icon={<FaProjectDiagram />}
                  />
                  <DataCard 
                    title="Project Hours" 
                    subtext="View hours utilized and stay up to date with project hours."
                    href="/dashboard/projects"
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
          <section className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Clients</h3>
                <p className="text-sm text-muted-foreground">Seamlessly access information about your current and former clients.</p>
              </div>
              <DataCard 
                title="All Clients" 
                subtext="Stay connected with clients who are currently or have been on their design journey."
                href="/dashboard/clients"
                icon={<FaUserFriends />}
              />
          </section>

        </div>

        {/* Right Sidebar Column */}
        <aside className="space-y-6">
            
            {/* About Section */}
            <div className="bg-white p-6 rounded-md border border-[#E8E8E8] space-y-5">
                <h3 className="text-lg font-semibold text-foreground">About {tenant?.name || 'Designer'}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {tenant?.name || 'JL Coates Interior Design Studio'} is an award-winning design studio.
                </p>
                
                <div className="space-y-2.5 pt-1">
                    <a href="#" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                        <FaExternalLinkAlt className="text-xs" /> {tenant?.name || 'Designer'} Website
                    </a>
                    <a href="#" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                        <FaExternalLinkAlt className="text-xs" /> Interior Design Style Quiz
                    </a>
                    <a href="#" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                        <FaExternalLinkAlt className="text-xs" /> Style Quiz Results
                    </a>
                </div>
            </div>

            {/* Schedule Section */}
            <div className="bg-white p-6 rounded-md border border-[#E8E8E8] space-y-5">
                <h3 className="text-lg font-semibold text-foreground">Schedule</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Plan your next step with {tenant?.name || 'us'}.
                </p>
                
                <div className="space-y-2.5 pt-1">
                    <Link href="/dashboard/meetings/book" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                        <FaCalendarCheck className="text-xs" /> Schedule Discover Call
                    </Link>
                    <Link href="/dashboard/meetings/book" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                        <FaCalendarCheck className="text-xs" /> Schedule Site Visit
                    </Link>
                    <Link href="/dashboard/meetings/book" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                        <FaCalendarCheck className="text-xs" /> Schedule Kick-Off
                    </Link>
                </div>
            </div>
            
             {/* Designer In Mind Section */}
             <div className="bg-white p-6 rounded-md border border-[#E8E8E8] space-y-5">
                <h3 className="text-lg font-semibold text-foreground">About Designer In Mind</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Designer In Mind is a platform tailored specifically for the Interior Design Studio.
                </p>
                <div className="space-y-2.5 pt-1">
                    <a href="#" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                        <FaExternalLinkAlt className="text-xs" /> Designer In Mind Website
                    </a>
                </div>
            </div>

        </aside>
      </div>
    </div>
  )
}
