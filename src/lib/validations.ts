import {z} from "zod";

// Task Validation schema for creation (POST)

export const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    type: z.string().min(1, "Type is required").max(100,"Type too long"),
    topic: z.string().min(1, "Topic is required").max(200,"Topic is too long"),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional().default("TODO"),
    dueDate: z.string().datetime("Invalid date format").or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")),
//   companyId: z.string().uuid("Invalid company ID").optional().nullable(),
    companyId: z.string().optional().nullable(),
})


//Task validation schema for udaption (PATCH)


export const updateTaskSchema = z.object({
    title:z.string ().min(1, "Title is required ").max(200,"Title is too long").optional(),
    type: z.string().min(1,"Type is required").max(100,"Type too long").optional(),
    topic: z.string().min(1, "Topic is required").max(200,"Topic too long").optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    dueDate: z.string().datetime("Invalid date format").or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")).optional(),
    companyId: z.string().uuid("Invalid company ID").optional().nullable(),
})

//Company validation schema for POST

export const createCompnaySchema = z.object({
    name: z.string().min(1, "Company name is required").max(200, "Name too long"),
  role: z.string().min(1, "Role is required").max(200, "Role too long"),
  ctc: z.string().max(100, "CTC too long").optional(),
  location: z.string().max(200, "Location too long").optional(),
  rounds: z.string().max(500, "Rounds too long").optional(),
  requiredSkills: z.string().max(500, "Skills too long").optional(),

})

// Company validation schema for PATCH
export const updateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(200, "Name too long").optional(),
  role: z.string().min(1, "Role is required").max(200, "Role too long").optional(),
  ctc: z.string().max(100, "CTC too long").optional(),
  location: z.string().max(200, "Location too long").optional(),
  rounds: z.string().max(500, "Rounds too long").optional(),
  requiredSkills: z.string().max(500, "Skills too long").optional(),
})