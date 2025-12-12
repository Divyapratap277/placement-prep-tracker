import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../auth"
import { prisma } from "@/lib/prisma"
import { updateTaskSchema } from "@/lib/validations"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updateTaskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const data = parsed.data

    const updated = await prisma.task.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        title: data.title,
        type: data.type,
        status: data.status,
        topic: data.topic,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        companyId: data.companyId ?? undefined,
        description: data.description,
        notes: data.notes,
      },
    })

    if (updated.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Updated" })
  } catch (error) {
    console.error("PATCH task error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deleted = await prisma.task.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Deleted" })
  } catch (error) {
    console.error("DELETE task error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
