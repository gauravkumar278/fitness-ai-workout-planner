import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import 'dotenv/config';

const geminiAIApiKey = process.env.GOOGLE_API_KEY;

const model = new ChatGoogleGenerativeAI({
    model: "gemini-pro",
    apiKey: geminiAIApiKey,
});

// Define the schema for workout plan
const workoutSchema = z.object({
    dailyPlan: z.array(z.object({
        day: z.number(),
        warmup: z.array(z.object({
            name: z.string(),
            sets: z.number(),
            reps: z.number(),
            rest: z.string(),
        })),
        mainWorkout: z.array(z.object({
            name: z.string(),
            sets: z.number(),
            reps: z.number(),
            rest: z.string(),
        }))
    }))
});

// Create the parser
const parser = StructuredOutputParser.fromZodSchema(workoutSchema);

const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate(
        `You are a professional sports trainer specializing in soccer. 
        Based on the following athlete's profile, create a personalized workout plan focusing **only on the warm-up and main workout**.
    
    Name: {name}
    Age: {age}
    Gender: {gender}
    Weight: {weight} kg
    Height: {height} cm
    Sport: {sport}
    Position: {position}
    Injury History: {injuryHistory}
    Training Age: {trainingAge} years
    Program Name: {programName}
    Training Variables: {trainingVars}
    Last Week's Plan: {lastWeekPlan}
    Workout Exercises: {workoutExercises}
    Warm-up Exercises: {warmupExercises}
    Goals: {goals}
    
    Please provide a detailed plan for {days_week} days that includes:
    1. **Warm-up**: Specific warm-up exercises, sets, reps, rest periods.
    2. **Main workout**: Exercises, sets, reps, rest periods.
    
    Make sure the output is **valid JSON** and **does not include any additional commentary or explanations**. Output only the JSON object.

    {format_instructions}`
    ),
    model
]);

// Example usage with the provided data
// Example athlete data
const athleteData = {
    name: "John Doe",
    age: 25,
    gender: "Male",
    weight: 75,
    height: 180,
    sport: "Soccer",
    days_week: 3,
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

(async () => {
    try {
        const format_instructions = await parser.getFormatInstructions();

        const structured_llm = model.withStructuredOutput(workoutSchema, parser);

        // const response = await chain.invoke({
        //     ...athleteData,
        //     format_instructions: format_instructions
        // });
        const response = await structured_llm.invoke("Generate workout plans");
        console.log("response", response);
    } catch (error) {
        console.error("Error generating workout plan:", error);
    }
})();