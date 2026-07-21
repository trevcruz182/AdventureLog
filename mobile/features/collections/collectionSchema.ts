import {z} from "zod";

export const collectionIcons = [
    "map-outline",
    "leaf-outline",
    "snow-outline",
    "restaurant-outline",
    "trophy-outline",
    "airplane-outline",
    "camera-outline",
    "compass-outline",
] as const;

export const collectionSchema = z.object({
    title: z.string().trim().min(2, "Enter at least two characters.").max(60, "Use 60 characters or fewer."),

    description: z.string().trim().max(300, "Use 300 characters or fewer."),

    icon: z.enum(collectionIcons),

    targetCount: z.number().int().min(1).max(100)
});

export type CollectionFormValues = z.infer<typeof collectionSchema>;

export const collectionDefaultValues: CollectionFormValues = {
    title: "",
    description: "",
    icon: "map-outline",
    targetCount: 5,
};