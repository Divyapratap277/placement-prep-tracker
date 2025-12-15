"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, CheckSquare, LogOut, Plus } from "lucide-react"

type Stats = {
  totalCompanies: number
  totalTasks: number
  doneTasks: number
  inProgressTasks: number
  todoTasks: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalCompanies: 0,
    totalTasks: 0,
    doneTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
  })
  const [loading, setLoading] = useState(true)
  const [loadedOnce, setLoadedOnce] = useState(false)
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      if (!loadedOnce) {
        fetchStats()
      } else {
        setLoading(false)
      }
    }
  }, [status, router, loadedOnce])

  async function fetchStats() {
    try {
      setLoading(true)

      const companiesRes = await fetch("/api/companies")
      const companiesJson = companiesRes.ok ? await companiesRes.json() : []
      const companies = Array.isArray(companiesJson)
        ? companiesJson
        : companiesJson.items ?? []

      const tasksRes = await fetch("/api/tasks")
      const tasksJson = tasksRes.ok ? await tasksRes.json() : []
      const tasks = Array.isArray(tasksJson)
        ? tasksJson
        : tasksJson.items ?? []

      setStats({
        totalCompanies: companies.length,
        totalTasks: tasks.length,
        doneTasks: tasks.filter((t: any) => t.status === "DONE").length,
        inProgressTasks: tasks.filter(
          (t: any) => t.status === "IN_PROGRESS",
        ).length,
        todoTasks: tasks.filter((t: any) => t.status === "TODO").length,
      })

      setUpcomingTasks(
        tasks
          .filter(
            (t: any) => t.status === "TODO" || t.status === "IN_PROGRESS",
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.dueDate).getTime() -
              new Date(b.dueDate).getTime(),
          )
          .slice(0, 5),
      )

      setLoadedOnce(true)
    } catch (error) {
      console.error("fetchStats error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Placement Prep Tracker</h1>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-500">Loading dashboard...</div>
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
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-6 py-3 flex gap-6">
          <Link
            href="/dashboard"
            className="text-blue-600 font-medium border-b-2 border-blue-600 pb-3"
          >
            Dashboard
          </Link>
          <Link
            href="/companies"
            className="text-gray-600 hover:text-blue-600 pb-3"
          >
            Companies
          </Link>
          <Link
            href="/tasks"
            className="text-gray-600 hover:text-blue-600 pb-3"
          >
            Tasks
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Companies
              </CardTitle>
              <Building2 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalCompanies}
              </div>
              <Link href="/companies">
                <Button variant="link" className="px-0 mt-2">
                  View all →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Tasks
              </CardTitle>
              <CheckSquare className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTasks}</div>
              <p className="text-sm text-gray-500 mt-1">
                {stats.doneTasks} done · {stats.inProgressTasks} in progress ·{" "}
                {stats.todoTasks} todo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completion Rate
              </CardTitle>
              <CheckSquare className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalTasks > 0
                  ? Math.round(
                      (stats.doneTasks / stats.totalTasks) * 100,
                    )
                  : 0}
                %
              </div>
              <Link href="/tasks">
                <Button variant="link" className="px-0 mt-2">
                  Manage tasks →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions + Getting Started + Upcoming */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/companies">
                <Button className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Company
                </Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Task
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Add your target companies</li>
                <li>Create prep tasks for each company</li>
                <li>Track your progress daily</li>
                <li>Mark tasks as done when completed</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-gray-500">No pending tasks</p>
              ) : (
                <ul className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex justify-between items-start text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          {task.topic} • {task.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-orange-600">
                          {new Date(
                            task.dueDate,
                          ).toLocaleDateString()}
                        </p>
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded ${
                            task.status === "TODO"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {task.status === "TODO"
                            ? "To Do"
                            : "In Progress"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/tasks">
                <Button variant="link" className="px-0 mt-3 w-full">
                  View all tasks →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
