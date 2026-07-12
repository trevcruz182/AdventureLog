import { AdventureCategory } from "./home";

export type JournalAdventure = {
    id: string;
    title: string;
    location: string;
    date: string;
    month: string;
    year: number;
    category: AdventureCategory;
    imageUrl: string;
    rating: number;
    description: string;
    isFavorite: boolean;
};

export const journalAdventures: JournalAdventure[] = [
    {
        id: "adventure-1",
        title: "Sunset at Bear Mountain",
        location: "Bear Mountain, New York",
        date: "July 6",
        month: "July",
        year: 2026,
        category: "hiking",
        imageUrl: "https://images.unsplash.com/photo-1671433709069-8ef7ab4e9c4e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        rating: 5,
        description: "Reached the overlook just before sunset and watched the Hudson Valley turn gold.",
        isFavorite: true,
    },
    {
        id: "adventure-2",
        title: "Friday Night Hockey",
        location: "Brewster Ice Arena",
        date: "July 3",
        month: "July",
        year: 2026,
        category: "sports",
        imageUrl: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1000&q=85",
        rating: 4,
        description: "A fast late-night skate with a close final game and plenty of good moments.",
        isFavorite: false,
    },
    {
        id: "adventure-3",
        title: "Hudson River Walk",
        location: "Peekskill, New York",
        date: "June 28",
        month: "June",
        year: 2026,
        category: "outdoors",
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85",
        rating: 4,
        description: "A quiet afternoon by the river with clear skies and an unexpectedly great view.",
        isFavorite: false,
    },
    {
        id: "adventure-4",
        title: "A Day in Beacon",
        location: "Beacon, New York",
        date: "June 21",
        month: "June",
        year: 2026,
        category: "travel",
        imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=85",
        rating: 5,
        description: "Explored Main Street, found a great bookstore, and finished the day near the water.",
        isFavorite: true,
    },
    {
        id: "adventure-5",
        title: "Lakeside Lunch",
        location: "Lake Mahopac, New York",
        date: "June 14",
        month: "June",
        year: 2026,
        category: "food",
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=85",
        rating: 4,
        description: "A relaxed lunch overlooking the lake with a perfect seat outside.",
        isFavorite: false,
    },
    {
        id: "adventure-6",
        title: "Anthony's Nose Trail",
        location: "Cortlandt, New York",
        date: "May 30",
        month: "May",
        year: 2026,
        category: "hiking",
        imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1000&q=85",
        rating: 5,
        description: "A challenging climb that paid off with one the best overlooks nearby.",
        isFavorite: true,
    },
];