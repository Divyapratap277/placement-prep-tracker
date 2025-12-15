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
    
    //Reading page + size of page from URL: /api/companies?page=2&pageSize=25
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")?? "1");
    const pageSize = Number(searchParams.get("pageSize")?? "10")

    //

    const take = Math.min(Math.max(pageSize, 1),75);  //betn 1-75
    const currentPage = Math.max(page, 1);
    const skip = (currentPage - 1) * take;

    const [items,totalCount]= await Promise.all([
      prisma.company.findMany({
        where:{ userId: session.user.id as string },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.company.count({
        where: { userId: session.user.id as string },
      }),
    ])

    // Compute total pages for "Page X of Y"
    const totalPages = Math.max(Math.ceil(totalCount / take), 1);

    // Return data + metadata
    return NextResponse.json({
      items,
      totalPages,
      totalCount,
      page: currentPage,
      pageSize: take,
    });
    
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
