import { z } from 'zod'; 
// Define valid colors as a type union
//export type ValidColor = 'red' | 'blue' | 'green' | 'gray' | 'purple' | 'pink' | 'orange' | 'yellow' | 'lime';


const VALID_COLORS = ['red', 'blue', 'green', 'gray', 'purple', 'pink', 'orange', 'yellow', 'lime'] as const;
export type ValidColor = (typeof VALID_COLORS)[number]; 

export type Label ={
    name: string;
    color: ValidColor; 
    labelId: number; // Optional label ID for existing labels
}

//! zod schema for Label 
export const LabelSchema = z.object({
    name: z.string().min(1, "label name is required"),
    color: z.enum(VALID_COLORS, {
        errorMap: () => ({ message: "Invalid color" }), // Custom error message for invalid color
    }),
    labelId: z.number().optional(), // Optional label ID for existing labels
})