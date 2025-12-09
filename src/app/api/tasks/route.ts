import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../auth"
import { prisma } from "@/lib/prisma"
import { createTaskSchema } from "@/lib/validations"

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

    // 1) Validate body with Zod schema
    const parsed = createTaskSchema.safeParse(body)

    if (!parsed.success) {
      console.log("ZOD ERROR:", parsed.error.flatten().fieldErrors)
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    // 2) Use validated data (types and required fields guaranteed)
    const data = parsed.data
    const { title, type, status, topic, dueDate, companyId } = data

    // 3) If companyId is provided, ensure it exists for this user
    if (companyId) {
      const company = await prisma.company.findFirst({
        where: {
          id: companyId,
          userId: session.user.id,
        },
      })

      if (!company) {
        return NextResponse.json(
          { error: "Company not found or access denied" },
          { status: 400 },
        )
      }
    }

    // 4) Create task using safe, validated data
    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title,
        type,
        status: status || "TODO", // default if not sent
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
