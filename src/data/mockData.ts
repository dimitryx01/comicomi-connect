
// Mock data for the application

// Users
export const users = [
  {
    id: "1",
    name: "Jamie Oliver",
    username: "jamieoliver",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    bio: "Chef, restaurateur, and cookbook author. I love simple food done right!",
    city: "London",
    country: "UK",
    followers: 542,
    following: 123,
  },
  {
    id: "2",
    name: "Sophia Rodriguez",
    username: "sophiaeat",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    bio: "Food blogger and photographer. Always searching for the next delicious meal.",
    city: "Barcelona",
    country: "Spain",
    followers: 289,
    following: 315,
  },
  {
    id: "3",
    name: "David Chen",
    username: "davidfoodie",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    bio: "Home cook, recipe developer, and coffee enthusiast.",
    city: "Tokyo",
    country: "Japan",
    followers: 612,
    following: 148,
  }
];

// Restaurants
export const restaurants = [
  {
    id: "1",
    name: "The Olive Garden",
    cuisine: "Italian",
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    location: "123 Main St, New York, NY",
    reviewCount: 248,
    description: "Authentic Italian cuisine in a cozy atmosphere. Our pasta is made fresh daily and our wines are imported directly from Italy.",
    phone: "(212) 555-1234",
    website: "www.olivegarden.com",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
  },
  {
    id: "2",
    name: "Sushi Delight",
    cuisine: "Japanese",
    rating: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    location: "456 Oak Ave, San Francisco, CA",
    reviewCount: 189,
    description: "Premium sushi and traditional Japanese dishes made with fish flown in daily from Tokyo's Tsukiji market.",
    phone: "(415) 555-6789",
    website: "www.sushidelight.com",
    hours: "Tue-Sun: 12:00 PM - 11:00 PM, Mon: Closed",
  },
  {
    id: "3",
    name: "Taqueria El Sol",
    cuisine: "Mexican",
    rating: 4.2,
    imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    location: "789 Pine St, Austin, TX",
    reviewCount: 320,
    description: "Family-owned taqueria serving authentic Mexican street food. Our tortillas are made by hand every morning.",
    phone: "(512) 555-9012",
    website: "www.taqueriaelsol.com",
    hours: "Mon-Sun: 10:00 AM - 11:00 PM",
  }
];

// Posts
export const posts = [
  {
    id: "1",
    user: users[0],
    content: "Just made my famous pasta carbonara! The key is to use freshly cracked black pepper and high-quality Pecorino Romano. What's your favorite pasta dish? 🍝 #ItalianFood #Homemade",
    imageUrl: "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHBhc3RhfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    likes: 124,
    comments: 32,
    createdAt: "2023-05-15T14:23:01Z",
    restaurant: null
  },
  {
    id: "2",
    user: users[1],
    content: "Found this amazing sushi restaurant in the heart of Barcelona! The omakase experience was out of this world. So fresh and creative! 🍣 #FoodieFind #Sushi",
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3VzaGl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    likes: 89,
    comments: 14,
    createdAt: "2023-05-12T18:45:22Z",
    restaurant: {
      id: "2",
      name: "Sushi Delight"
    }
  },
  {
    id: "3",
    user: users[2],
    content: "Morning coffee ritual ☕ There's something so therapeutic about grinding your own beans and watching the pour-over process. What's your coffee method of choice?",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y29mZmVlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    likes: 67,
    comments: 28,
    createdAt: "2023-05-10T08:12:45Z",
    restaurant: null
  },
  {
    id: "4",
    user: users[0],
    content: "Had the most incredible farm-to-table experience at The Olive Garden last night. Everything was harvested that morning and you could really taste the difference! #LocalFood #Sustainable",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudCUyMGZvb2R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    likes: 215,
    comments: 42,
    createdAt: "2023-05-08T19:30:11Z",
    restaurant: {
      id: "1",
      name: "The Olive Garden"
    }
  },
  {
    id: "5",
    user: users[1],
    content: "Taco Tuesday done right! These street tacos from Taqueria El Sol were absolutely bursting with flavor. The homemade salsa verde is a game-changer! 🌮 #TacoTuesday #MexicanFood",
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGFjb3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    likes: 156,
    comments: 23,
    createdAt: "2023-05-02T12:15:33Z",
    restaurant: {
      id: "3",
      name: "Taqueria El Sol"
    }
  }
];
