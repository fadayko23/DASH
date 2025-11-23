import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FaPlus, FaSearch, FaFilter } from "react-icons/fa"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const session = await auth()
  if (!session?.user?.tenantId) return <div>Unauthorized</div>

  const { category } = await params
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1)

  // Fetch products for this category
  // Assuming category slug maps loosely to ProductType category name or similar
  // For now, fetching all products and we can filter client-side or improve query
  // A real implementation would join ProductCategory
  const products = await prisma.product.findMany({
      where: { 
          // Simple filter for demo: status active
          status: 'active',
          // In a real app, we'd filter by category relation:
          // productType: { category: { name: { equals: category, mode: 'insensitive' } } }
      },
      include: {
          productType: { include: { category: true } },
          vendor: true,
          media: { orderBy: { sortOrder: 'asc' }, take: 1 }
      }
  })

  // Filter in memory for now if DB relation query is complex or category naming varies
  // This expects the URL slug to match the Category Name or Type Name partially
  const filteredProducts = products.filter(p => {
      if (category === 'all') return true
      const catName = p.productType.category.name.toLowerCase()
      const typeName = p.productType.name.toLowerCase()
      return catName.includes(category.toLowerCase()) || typeName.includes(category.toLowerCase())
  })

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{categoryName}</h1>
                <p className="text-muted-foreground mt-1">Browse and manage {category} selections.</p>
            </div>
            <div className="flex gap-3">
                <button className="flex items-center gap-2 border bg-background px-4 py-2 rounded-md text-sm hover:bg-accent">
                    <FaFilter /> Filter
                </button>
                <Link href={`/dashboard/inventory/product/new?category=${category}`} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium">
                    <FaPlus /> Add {categoryName.slice(0, -1)}
                </Link>
            </div>
        </div>

        {/* Visual Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
                <Link href={`/dashboard/inventory/product/${product.id}`} key={product.id} className="group flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-all hover:border-primary/50">
                    {/* Image Aspect Ratio Container */}
                    <div className="aspect-square bg-muted relative overflow-hidden">
                        {product.media[0]?.url ? (
                            <div className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105" style={{ backgroundImage: `url(${product.media[0].url})` }} />
                        ) : (
                             <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted">
                                No Image
                             </div>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                                {product.vendor?.name}
                            </span>
                        </div>
                    </div>
                    
                    {/* Details */}
                    <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                        <div className="text-xs text-muted-foreground mb-2">{product.baseSku || 'No SKU'}</div>
                        <div className="mt-auto flex justify-between items-center">
                            <span className="text-xs font-medium bg-secondary px-2 py-1 rounded text-secondary-foreground">
                                {product.productType.name}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
            
            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed rounded-lg bg-muted/10">
                    <div className="text-lg font-medium mb-2">No products found in {categoryName}</div>
                    <p className="text-sm max-w-md text-center">Get started by adding new items to your catalog or checking your filter settings.</p>
                    <Link href={`/dashboard/inventory/product/new?category=${category}`} className="mt-4 text-primary hover:underline">
                        Add your first item
                    </Link>
                </div>
            )}
        </div>
    </div>
  )
}

