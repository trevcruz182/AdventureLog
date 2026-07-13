import { AdventureCategory } from "./home";

export type MapAdventure = {
    id: string;
    title: string;
    location: string;
    date: string;
    category: AdventureCategory;
    latitude: number;
    longitude: number;
    imageUrl: string;
};

export const mapAdventures: MapAdventure[] = [
    {
        id: "adventure-1",
        title: "Sunset at Bear Mountain",
        location: "Bear Mountain, New York",
        date: "July 6, 2026",
        category: "hiking",
        latitude: 41.3127,
        longitude: -73.9882,
        imageUrl: "https://images.unsplash.com/photo-1671433709069-8ef7ab4e9c4e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        id: "adventure-2",
        title: "Friday Night Hockey",
        location: "Brewster Ice Arena",
        date: "July 3, 2026",
        category: "sports",
        latitude: 41.4215,
        longitude: -73.5767,
        imageUrl: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: "adventure-3",
        title: "Hudson River Walk",
        location: "Peekskill, New York",
        date: "June 28, 2026",
        category: "outdoors",
        latitude: 41.2901,
        longitude: -73.9204,
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: "adventure-4",
        title: "A Day in Beacon",
        location: "Beacon, New York",
        date: "June 21, 2026",
        category: "travel",
        latitude: 41.5048,
        longitude: -73.9696,
        imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: "adventure-5",
        title: "Lakeside Lunch",
        location: "Lake Mahopac, New York",
        date: "June 14, 2026",
        category: "food",
        latitude: 41.3723,
        longitude: -73.7335,
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: "adventure-6",
        title: "Anthony's Nose Trail",
        location: "Cortlandt, New York",
        date: "May 30, 2026",
        category: "hiking",
        latitude: 41.3014,
        longitude: -73.9517,
        imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1000&q=85",
    },
];