import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import {auth }  from "../../../../../auth"


//PATCH: update the company

export async function PATCH(
    req:NextRequest,
    {params}:{params: {id:string}}
)
{
    try {
        const session = await auth()
        if(!session?.user?.id)
        {
            return NextResponse.json({error:"Unauthorized"}, {status:401})
        }

        const body = await req.json()
        const {role, ctc, name, location, rounds, requiredSkills}= body

        const company = await prisma.company.updateMany({
            where :{
                id:params.id,
                userId:session.user.id,
            },
            data:{
                name,
                role,
                ctc,
                location,
                rounds,
                requiredSkills,
            }
        })

        if(company.count === 0)
        {
           return NextResponse.json({error: "Not FOund "}, {status:404})
        }
        return NextResponse.json({message:"Updated"})

    } catch (error) {
        console.error("PATCH company error:", error)
        return NextResponse.json({error: "Internal error"}, {status:500})
    }
}

// DELETE company
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
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


