import { prisma } from "@/lib/prisma"
import IntakeFormClient from "./client"

export default async function IntakePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const form = await prisma.intakeForm.findUnique({
      where: { slug }
  })

  if (!form) return <div>Form not found</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{form.name}</h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <IntakeFormClient form={form} />
            </div>
        </div>
    </div>
  )
}
