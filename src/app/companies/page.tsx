"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Edit, Plus, LogOut } from "lucide-react"

type Company = {
  id: string
  name: string
  role: string
  ctc: string
  location: string
  rounds: string
  requiredSkills: string
}

export default function CompaniesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    ctc: "",
    location: "",
    rounds: "",
    requiredSkills: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchCompanies()
    }
  }, [status, router])

  async function fetchCompanies() {
    try {
      const res = await fetch("/api/companies")
      if (res.ok) {
        const data = await res.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = editingId ? `/api/companies/${editingId}` : "/api/companies"
    const method = editingId ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchCompanies()
        setOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this company?")) return

    try {
      const res = await fetch(`/api/companies/${id}`, { method: "DELETE" })
      if (res.ok) fetchCompanies()
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  function handleEdit(company: Company) {
    setEditingId(company.id)
    setFormData({
      name: company.name,
      role: company.role,
      ctc: company.ctc,
      location: company.location,
      rounds: company.rounds,
      requiredSkills: company.requiredSkills,
    })
    setOpen(true)
  }

  function resetForm() {
    setEditingId(null)
    setFormData({
      name: "",
      role: "",
      ctc: "",
      location: "",
      rounds: "",
      requiredSkills: "",
    })
  }

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Target Companies</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Company" : "Add Company"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Role *</Label>
                  <Input
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>CTC</Label>
                  <Input
                    value={formData.ctc}
                    onChange={(e) =>
                      setFormData({ ...formData, ctc: e.target.value })
                    }
                    placeholder="e.g., 25 LPA"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Rounds</Label>
                  <Input
                    value={formData.rounds}
                    onChange={(e) =>
                      setFormData({ ...formData, rounds: e.target.value })
                    }
                    placeholder="e.g., OA, Tech 1, Tech 2, HR"
                  />
                </div>
                <div>
                  <Label>Required Skills</Label>
                  <Input
                    value={formData.requiredSkills}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requiredSkills: e.target.value,
                      })
                    }
                    placeholder="e.g., DSA, System Design, Java"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>CTC</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rounds</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.role}</TableCell>
                  <TableCell>{company.ctc}</TableCell>
                  <TableCell>{company.location}</TableCell>
                  <TableCell>{company.rounds}</TableCell>
                  <TableCell>{company.requiredSkills}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(company)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {companies.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No companies yet. Add your first target company!
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
