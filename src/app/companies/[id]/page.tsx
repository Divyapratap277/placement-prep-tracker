"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, ArrowLeft, Plus } from "lucide-react"

type Task = {
  id: string
  title: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  type: string
  topic: string
  dueDate: string
}

type CompanyDetail = {
  id: string
  name: string
  role: string
  ctc: string
  location: string
  rounds: string
  requiredSkills: string
  tasks: Task[]
}

export default function CompanyDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // SAFER: normalize params.id to always be a string
  const rawParams = useParams()
  const companyId =
    typeof rawParams.id === "string"
      ? rawParams.id
      : Array.isArray(rawParams.id)
      ? rawParams.id[0]
      : ""

  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && companyId) {
      fetchCompany()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, companyId])

  async function fetchCompany() {
    try {
      const res = await fetch(`/api/companies/${companyId}`)
      if (res.ok) {
        const data = await res.json()
        setCompany(data)
      } else {
        setCompany(null)
      }
    } catch (error) {
      console.error("Company detail fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold">Placement Prep Tracker</h1>
          </div>
        </header>
        <main className="container mx-auto p-6">
          <div className="text-center text-gray-500">Loading company...</div>
        </main>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold">Placement Prep Tracker</h1>
          </div>
        </header>
        <main className="container mx-auto p-6">
          <p className="text-center text-gray-500">Company not found.</p>
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => router.push("/companies")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to companies
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Placement Prep Tracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {session?.user?.name}
            </span>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-6 py-3 flex gap-6">
          <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 pb-3">
            Dashboard
          </Link>
          <Link
            href="/companies"
            className="text-blue-600 font-medium border-b-2 border-blue-600 pb-3"
          >
            Companies
          </Link>
          <Link href="/tasks" className="text-gray-600 hover:text-blue-600 pb-3">
            Tasks
          </Link>
        </div>
      </nav>

      <main className="container mx-auto p-6 space-y-6">
        {/* Back + Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/companies")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-3xl font-bold">
              {company.name} – {company.role}
            </h2>
          </div>
          {/* Quick action: add task for this company */}
          <Link href={`/tasks`} className="inline-flex">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add task for this company
            </Button>
          </Link>
        </div>

        {/* Company details */}
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">CTC:</span> {company.ctc || "-"}</p>
              <p><span className="font-medium">Location:</span> {company.location || "-"}</p>
            </div>
            <div>
              <p><span className="font-medium">Rounds:</span> {company.rounds || "-"}</p>
              <p><span className="font-medium">Required Skills:</span> {company.requiredSkills || "-"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tasks for this company */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks for this company</CardTitle>
          </CardHeader>
          <CardContent>
            {company.tasks.length === 0 ? (
              <p className="text-sm text-gray-500">
                No tasks yet. Create one from the Tasks page and link this company.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{task.type}</TableCell>
                      <TableCell>{task.topic}</TableCell>
                      <TableCell>{task.status}</TableCell>
                      <TableCell>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
