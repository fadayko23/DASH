import { FaLayerGroup, FaHammer, FaCouch, FaLeaf, FaMountain } from "react-icons/fa"
import Link from "next/link"

export default function InventoryHubPage() {
  const categories = [
      { name: 'Finishes', slug: 'finishes', icon: <FaLayerGroup size={24} />, desc: 'Tiles, Paint, Wood, etc.' },
      { name: 'Fixtures', slug: 'fixtures', icon: <FaHammer size={24} />, desc: 'Plumbing, Lighting, Hardware.' },
      { name: 'Furnishings', slug: 'furnishings', icon: <FaCouch size={24} />, desc: 'Furniture, Rugs, Window Treatments.' },
      { name: 'Interiors', slug: 'interiors', icon: <FaLeaf size={24} />, desc: 'Interior architectural elements.' },
      { name: 'Exteriors', slug: 'exteriors', icon: <FaMountain size={24} />, desc: 'Exterior finishes and landscaping.' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Catalog</h1>
        <p className="text-muted-foreground mb-8">Manage your design library.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
                <Link href={`/dashboard/inventory/${cat.slug}`} key={cat.slug} className="bg-card border rounded-xl p-8 hover:border-primary/50 hover:shadow-md transition-all flex flex-col items-center text-center gap-4 group">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                        {cat.icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{cat.desc}</p>
                    </div>
                </Link>
            ))}
        </div>
    </div>
  )
}
