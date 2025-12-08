import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../auth"
import { prisma } from "@/lib/prisma"

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
    const { title, type, status, topic, dueDate, companyId } = body

    const updated = await prisma.task.updateMany({
      where: {
        id: params.id,             // plain string
        userId: session.user.id,   // plain string
      },
      data: {
        title,
        type,
        status,
        topic,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        companyId: companyId ?? undefined,
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
        id: params.id,             // plain string
        userId: session.user.id,   // plain string
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
