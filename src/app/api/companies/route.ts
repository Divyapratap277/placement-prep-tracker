// src/app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../auth"
import { prisma } from "@/lib/prisma"

// GET all companies for logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companies = await prisma.company.findMany({
      where: { userId: session.user.id as string },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error("GET companies error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// POST create new company
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, role, ctc, location, rounds, requiredSkills } = body

    if (!name || !role) {
      return NextResponse.json(
        { error: "Name and role are required" },
        { status: 400 }
      )
    }

    const company = await prisma.company.create({
      data: {
        userId: session.user.id as string,
        name,
        role,
        ctc: ctc || "",
        location: location || "",
        rounds: rounds || "",
        requiredSkills: requiredSkills || "",
      },
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error("POST company error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
