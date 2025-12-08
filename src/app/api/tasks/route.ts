import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      include: { company: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("GET tasks error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, type, status, topic, dueDate, companyId } = body

    if (!title || !type || !topic || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title,
        type,
        status: status || "TODO",
        topic,
        dueDate: new Date(dueDate),
        companyId: companyId || null,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("POST task error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
