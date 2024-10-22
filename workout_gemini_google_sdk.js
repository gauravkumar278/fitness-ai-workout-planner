// Import necessary components from the Google Generative AI SDK
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import 'dotenv/config';

const geminiAIApiKey = process.env.GOOGLE_API_KEY;
// Initialize the Google Generative AI client with your API key
const genAI = new GoogleGenerativeAI(geminiAIApiKey);

// Define a schema for the workout structure (warmup and main workout sections)
const schema = {
    description: "Workout plan with warmup and main workout sections",
    type: SchemaType.OBJECT,
    properties: {
        warmup: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING, nullable: false },  // Exercise name
                    sets: { type: SchemaType.NUMBER, nullable: false }, // Number of sets
                    reps: { type: SchemaType.NUMBER, nullable: false }, // Number of reps
                    rest: { type: SchemaType.STRING, nullable: false }, // Rest time (e.g., "1min")
                },
                required: ["name", "sets", "reps", "rest"]
            }
        },
        mainWorkout: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING, nullable: false },  // Exercise name
                    sets: { type: SchemaType.NUMBER, nullable: false }, // Number of sets
                    reps: { type: SchemaType.NUMBER, nullable: false }, // Number of reps
                    rest: { type: SchemaType.STRING, nullable: false }, // Rest time (e.g., "2min")
                },
                required: ["name", "sets", "reps", "rest"]
            }
        }
    },
    required: ["warmup", "mainWorkout"]  // Ensure both sections are present
};

// Initialize the generative model with the proper schema
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro", // Choose the appropriate model
    generationConfig: {
        responseMimeType: "application/json", // Expect JSON output
        responseSchema: schema,               // Apply the workout schema
    },
});

// Define athlete data (you can fetch this from a database or user input)
const athleteData = {
    name: "John Doe",
    age: 25,
    gender: "Male",
    weight: 75,
    height: 180,
    sport: "Soccer",
    position: "Midfielder",
    injuryHistory: "Ankle sprain (2023), Minor knee strain (2022)",
    trainingAge: 5,
    programName: "Elite Midfielder Development Program",
    trainingVars: "Strength, Endurance, Agility, Speed",
    lastWeekPlan: `Monday: Lower body strength
Tuesday: High-intensity interval training
Wednesday: Recovery and mobility
Thursday: Upper body strength
Friday: Speed and agility
Saturday: Match simulation
Sunday: Active recovery`,
    workoutExercises: "Bulgarian split squats, Box jumps, Deadlifts, Medicine ball throws, Resistance band sprints, Agility ladder drills",
    warmupExercises: "Dynamic stretching, Light jogging, Mobility exercises, Movement preparation",
    goals: "Improve acceleration and speed, Enhance endurance for 90-minute matches, Strengthen core and lower body, Develop better agility for quick direction changes"
};
// Asynchronous function to generate a fitness workout plan
const generateWorkout = async () => {
    try {
        // Prompt to generate a workout with warmup and main workout
        const result = await model.generateContent(
            `Generate a fitness workout plan for ${athleteData.name} (${athleteData.age} years old, ${athleteData.gender}) who plays ${athleteData.sport} as a ${athleteData.position}.\n\nAthlete Info:\n- Injury History: ${athleteData.injuryHistory}\n- Training Age: ${athleteData.trainingAge} years\n- Program Name: ${athleteData.programName}\n- Training Variables: ${athleteData.trainingVars}\n\nLast Week's Plan:\n${athleteData.lastWeekPlan}\n\nWorkout Exercises:\n${athleteData.workoutExercises}\n\nWarm-up Exercises:\n${athleteData.warmupExercises}\n\nAthlete Goals:\n${athleteData.goals}`
        );
        // Output the generated workout content (warmup and main workout sections)
        const parsedResult = JSON.parse(result.response.text());
        console.log("Workout Plan:", parsedResult);

    } catch (error) {
        console.error("Error generating workout plan:", error);
    }
};

// Call the function to generate the workout
generateWorkout();
