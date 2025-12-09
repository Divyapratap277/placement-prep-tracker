// src/app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../auth"
import { prisma } from "@/lib/prisma"
import { createCompnaySchema } from "@/lib/validations"
import { error } from "console"

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

    const parsed = createCompnaySchema.safeParse(body)
    if(!parsed.success)
    {
      return NextResponse.json(
        {
          error:"Validation Failed",
          details:parsed.error.flatten().fieldErrors
        },
        {status:400},
      )
    }

    const data= parsed.data

    const company= await prisma.company.create({
      data:{
        userId: session.user.id,
        name: data.name,
        role: data.role,
        ctc: data.ctc || "",
        location: data.location || "",
        rounds: data.rounds || "",
        requiredSkills: data.requiredSkills || "",
      }
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error("POST company error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
