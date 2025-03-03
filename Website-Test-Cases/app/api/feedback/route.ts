import { NextResponse } from "next/server";

// Define the FeedbackEntry type
export type FeedbackEntry = {
  id: string;
  adventurerName: string;
  characterClass: string;
  realm: string;
  questExperience: string;
  magicalItems: string[];
  rating: number;
  timestamp: string;
};

// Mock feedback entries data
const mockFeedbackEntries: FeedbackEntry[] = [
  {
    id: "feedback-1",
    adventurerName: "Aragorn",
    characterClass: "Ranger",
    realm: "Gondor",
    questExperience:
      "The quest was most enjoyable, though I did face a few challenges. The interface scrolls were easy to decipher, and the magical items were quite useful during my journey.",
    magicalItems: [
      "Interface Potion",
      "Navigation Crystal",
      "Responsive Scroll",
    ],
    rating: 5,
    timestamp: "2023-05-15T10:23:45Z",
  },
  {
    id: "feedback-2",
    adventurerName: "Gandalf",
    characterClass: "Wizard",
    realm: "Valinor",
    questExperience:
      "A most intriguing experience. The form validation spells were particularly effective, though I would suggest adding more tooltips for novice adventurers.",
    magicalItems: ["Validation Wand", "Error Detector", "Submit Button"],
    rating: 4,
    timestamp: "2023-05-14T08:42:12Z",
  },
  {
    id: "feedback-3",
    adventurerName: "Legolas",
    characterClass: "Archer",
    realm: "Mirkwood",
    questExperience:
      "The quest flowed smoothly like the rivers of my homeland. The animations were particularly pleasing to the eye, and the navigation was intuitive.",
    magicalItems: ["Animation Scroll", "Navigation Map", "Elven Interface"],
    rating: 5,
    timestamp: "2023-05-13T15:36:29Z",
  },
  {
    id: "feedback-4",
    adventurerName: "Gimli",
    characterClass: "Warrior",
    realm: "Erebor",
    questExperience:
      "Sturdy as dwarven craftsmanship, but the form was a bit too lengthy for my taste. Could use some condensing.",
    magicalItems: ["Form Shortener", "Validation Axe"],
    rating: 3,
    timestamp: "2023-05-12T11:18:05Z",
  },
  {
    id: "feedback-5",
    adventurerName: "Frodo",
    characterClass: "Hobbit",
    realm: "The Shire",
    questExperience:
      "A surprisingly pleasant journey! The form was simple enough for a hobbit to understand, yet comprehensive enough to gather all necessary information.",
    magicalItems: [
      "Simplicity Ring",
      "User-Friendly Cloak",
      "Hobbit-Sized Buttons",
    ],
    rating: 4,
    timestamp: "2023-05-11T09:51:37Z",
  },
];

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.feedback) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a new feedback entry with timestamp
    const newEntry = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    // In a real app, you would save to a database
    mockFeedbackEntries.push(newEntry);

    return NextResponse.json(
      { message: "Feedback submitted successfully", id: newEntry.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing feedback:", error);
    return NextResponse.json(
      { error: "Failed to process feedback" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Simulate a delay to show loading state in the UI
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return the mock data
  return NextResponse.json(mockFeedbackEntries);
}
