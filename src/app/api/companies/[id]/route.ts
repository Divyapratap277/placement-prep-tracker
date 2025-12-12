import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import { authOptions } from "../../../../../auth"
import { getServerSession } from "next-auth"
import { updateCompanySchema } from "@/lib/validations";

// GET: Get the company + its tasks
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company = await prisma.company.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        tasks: {
          where: {
            userId: session.user.id,
            companyId: params.id,
          },
          orderBy: { dueDate: "asc" },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
    }

    console.log("DETAIL QUERY", { paramsId: params.id, userId: session.user.id })
    console.log("COMPANY RESULT", company)

    return NextResponse.json(company)
  } catch (error) {
    console.error("GET company detail error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// PATCH: update the company
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const parsed = updateCompanySchema.safeParse(body)
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

    const updated = await prisma.company.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data,
    })

    if (updated.count === 0) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Updated" })
  } catch (error) {
    console.error("PATCH company error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// DELETE company
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company = await prisma.company.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (company.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Deleted" })
  } catch (error) {
    console.error("DELETE company error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
