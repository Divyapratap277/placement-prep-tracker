"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, LogOut } from "lucide-react";

type Task = {
  id: string;
  title: string;
  type: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  topic: string;
  dueDate: string;
  companyId: string | null;
  company?: { name: string } | null;
  description?: string | null;
  notes?: string | null;
};

type CompanyOption = {
  id: string;
  name: string;
};

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    status: "TODO" as "TODO" | "IN_PROGRESS" | "DONE",
    topic: "",
    dueDate: "",
    companyId: "",
    description: "",
    notes: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (!loadedOnce) {
        fetchTasks(1, pageSize);
        fetchCompanies();
      } else {
        setLoading(false);
      }
    }
  }, [status, router, loadedOnce]);

  async function fetchTasks(currentPage = page, currentPageSize = pageSize) {
    try {
      const res = await fetch(
        `/api/tasks?page=${currentPage}&pageSize=${currentPageSize}`
      );
      if (res.ok) {
        const data = await res.json();
        const items: Task[] = Array.isArray(data.items) ? data.items : [];
        setTasks(items);
        setTotalPages(data.totalPages ?? 1);
        setPage(data.page ?? currentPage);
      }
      setLoadedOnce(true);
    } catch (error) {
      console.error("Fetch tasks error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCompanies() {
    try {
      const res = await fetch("/api/companies");
      if (res.ok) {
        const data = await res.json();
        const items: CompanyOption[] = Array.isArray(data.items) ? data.items : data;
        setCompanies(items);
      }
    } catch (error) {
      console.error("Fetch companies error:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editingId ? `/api/tasks/${editingId}` : "/api/tasks";
    const method = editingId ? "PATCH" : "POST";

    const payload = {
      ...formData,
      companyId: formData.companyId || null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchTasks();
        setOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Submit task error:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
      }
    } catch (error) {
      console.error("Delete task error:", error);
    }
  }

  // Inline status update
  async function handleStatusChange(
    taskId: string,
    newStatus: "TODO" | "IN_PROGRESS" | "DONE"
  ) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          type: task.type,
          status: newStatus,
          topic: task.topic,
          dueDate: task.dueDate,
          companyId: task.companyId,
          description: task.description,
          notes: task.notes,
        }),
      });

      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  }

  function handleEdit(task: Task) {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      type: task.type,
      status: task.status,
      topic: task.topic,
      dueDate: task.dueDate?.slice(0, 10),
      companyId: task.companyId || "",
      description: task.description || "",
      notes: task.notes || "",
    });
    setOpen(true);
  }

  function resetForm() {
    setEditingId(null);
    setFormData({
      title: "",
      type: "",
      status: "TODO",
      topic: "",
      dueDate: "",
      companyId: "",
      description: "",
      notes: "",
    });
  }

  // Apply filters
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterCompany !== "all" && task.companyId !== filterCompany)
      return false;
    if (
      filterType !== "all" &&
      task.type.toLowerCase() !== filterType.toLowerCase()
    )
      return false;
    const q = search.trim().toLowerCase();
    if (q) {
      const inTitle = task.title.toLowerCase().includes(q);
      const inDescription = (task.description ?? "").toLowerCase().includes(q);
      if (!inTitle && !inDescription) return false;
    }
    return true;
  });

  // Get unique task types for filter
  const taskTypes = Array.from(new Set(tasks.map((t) => t.type))).filter(
    Boolean
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Placement Prep Tracker</h1>
          </div>
        </header>
        <main className="container mx-auto p-6">
          <div className="text-center py-12 text-gray-500">
            Loading tasks...
          </div>
        </main>
      </div>
    );
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
            className="text-gray-600 hover:text-blue-600 pb-3"
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
            className="text-blue-600 font-medium border-b-2 border-blue-600 pb-3"
          >
            Tasks
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Prep Tasks</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Task" : "Add Task"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Type *</Label>
                  <Input
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    placeholder="e.g., DSA, System Design, Project"
                    required
                  />
                </div>
                <div>
                  <Label>Topic *</Label>
                  <Input
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    placeholder="e.g., Trees, OS, DBMS"
                    required
                  />
                </div>
                <div>
                  <Label>Status *</Label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as
                          | "TODO"
                          | "IN_PROGRESS"
                          | "DONE",
                      })
                    }
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
                <div>
                  <Label>Due Date *</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Company (optional)</Label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={formData.companyId}
                    onChange={(e) =>
                      setFormData({ ...formData, companyId: e.target.value })
                    }
                  >
                    <option value="">No company</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Description</Label>
                  <textarea
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="e.g., Watch Abdul Bari’s DP videos and solve 10 questions"
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <textarea
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Quick reminders, links, interview hints..."
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1 block">
                Filter by Status
              </Label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">
                Filter by Company
              </Label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
              >
                <option value="all">All Companies</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">
                Filter by Type
              </Label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                {taskTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">
                Search (title / description)
              </Label>
              <Input
                placeholder="e.g., React, DP, OS…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  {/* Title */}
                  <TableCell className="align-top">{task.title}</TableCell>

                  {/* Details: description + notes, truncated */}
                  <TableCell className="max-w-xs align-top">
                    {task.description ? (
                      <div
                        className="text-xs text-gray-600 overflow-hidden text-ellipsis line-clamp-2"
                        title={task.description || undefined}
                      >
                        {task.description}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        No description
                      </span>
                    )}
                    {task.notes && (
                      <div
                        className="text-xs text-gray-400 mt-1 overflow-hidden text-ellipsis whitespace-nowrap"
                        title={task.notes || undefined}
                      >
                        Notes: {task.notes}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="align-top">{task.type}</TableCell>
                  <TableCell className="align-top">{task.topic}</TableCell>
                  <TableCell className="align-top">
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(
                          task.id,
                          e.target.value as "TODO" | "IN_PROGRESS" | "DONE"
                        )
                      }
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </TableCell>
                  <TableCell className="align-top">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell className="align-top">
                    {task.company?.name || "-"}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3">
            {/* Rows per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  setPage(1);
                  setPageSize(newSize);
                  fetchTasks(1, newSize);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={75}>75</option>
              </select>
            </div>

            {/* Page info + buttons */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  const newPage = page - 1;
                  setPage(newPage);
                  fetchTasks(newPage, pageSize);
                }}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => {
                  const newPage = page + 1;
                  setPage(newPage);
                  fetchTasks(newPage, pageSize);
                }}
              >
                Next
              </Button>
            </div>
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {tasks.length === 0
                ? "No tasks yet. Add your first prep task!"
                : "No tasks match your filters."}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
