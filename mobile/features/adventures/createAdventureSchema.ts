import {z} from "zod";

export const adventureCategories = ["hiking", "sports", "travel", "food", "outdoors"] as const;

export const adventureStatuses = ["completed", "wishlist"] as const;

export const createAdventureSchema = z.object({
    title: z.string().trim().min(3, "Give your adventure a title.").max(80, "Keep the title under 80 characters."),

    status: z.enum(adventureStatuses, {
        message: "Choose whether this adventure is completed or planned."
    }),
    
    category: z.enum(adventureCategories, {message: "Choose an adventure category."}),

    description: z.string().trim().max(600, "Keep your memory under 600 characters."),

    date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD.").refine((value) => {
        const [year, month, day] = value.split("-").map(Number);

        const date = new Date(year, month-1, day);

        return(date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day);
    }, "Enter a valid calendar date."),

    locationName: z.string().trim().min(2, "Enter a location.").max(120, "Keep the location under 120 characters."),

    latitude: z.number().nullable(),
    longitude: z.number().nullable(),

    rating: z.number().int().min(1).max(5),

    isFavorite: z.boolean(),

    photos: z.array(z.string()).max(5, "You can add up to five photos.")
}).superRefine((values, context) => {
    if(values.status !== "completed") {
        return;
    }

    const [year, month, day] = values.date.split("-").map(Number);

    const selectedDate = new Date(year, month - 1, day);

    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if(selectedDate > today) {
        context.addIssue({
            code: "custom",
            path: ["date"],
            message: "A completed adventure cannot be dated in the future."
        });
    }
});

export type CreateAdventureFormValues = z.infer<typeof createAdventureSchema>;

export const CreateAdventureDefaultValues: CreateAdventureFormValues = {
    title: "",
    status: "completed",
    category: "outdoors",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    locationName: "",
    latitude: null,
    longitude: null,
    rating: 5,
    isFavorite: false,
    photos: [],
};