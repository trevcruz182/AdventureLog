const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if(!apiUrl) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured. Add it to mobile/.env.local.");
}

export const API_URL = apiUrl.replace(/\$/, "");