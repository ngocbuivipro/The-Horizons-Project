export const MOCK_LOCATIONS = [
    "Noi Bai International Airport",
    "Hanoi Old Quarter",
    "Da Nang International Airport",
    "Hoi An Ancient Town",
    "Ninh Binh",
    "Ha Long Bay"
];

export const MOCK_VEHICLES = [
    {
        _id: "car_1",
        name: "Sedan",
        image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=500", // Ảnh demo
        maxPassengers: 3,
        maxLuggage: 3,
        description: "Comfortable sedan for small groups. Toyota Vios or similar.",
        price: 62, // USD
        ppPrice: 31, // Per person
        tags: ["Door-to-door", "Driver speaks English"]
    },
    {
        _id: "car_2",
        name: "Compact MPV",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=500",
        maxPassengers: 4,
        maxLuggage: 4,
        description: "Extra space for luggage and comfort. Xpander or similar.",
        price: 75,
        ppPrice: 37.5,
        tags: ["Door-to-door", "Driver speaks English"]
    },
    {
        _id: "car_3",
        name: "Van",
        image: "https://images.unsplash.com/photo-1566008885218-90abf9200ddb?auto=format&fit=crop&q=80&w=500",
        maxPassengers: 7,
        maxLuggage: 7,
        description: "Best for families and groups. Ford Transit or similar.",
        price: 81,
        ppPrice: 40.5,
        tags: ["Door-to-door", "Driver speaks English"]
    }
];
