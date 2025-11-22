import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "mock-key",
});

export async function processMeetingRecording(recordingId: string) {
  const recording = await prisma.meetingRecording.findUnique({
    where: { id: recordingId },
    include: { meeting: { include: { project: true } } }
  });

  if (!recording) throw new Error("Recording not found");

  // Mock transcript generation if strictly mock mode or if file not actually audio processable here
  // For MVP, let's assume the transcript is either already there or we simulate it.
  // In real world: utilize Whisper API on `recording.storageUrl`
  
  const transcript = recording.transcript && recording.transcript !== "Transcript processing pending..." 
    ? recording.transcript 
    : `[MOCK TRANSCRIPT] 
    Client: I really like the blue tiles for the kitchen.
    Designer: Great, I'll note that down. We also need to decide on the backsplash.
    Client: Can we see some subway tile options by next Tuesday?
    Designer: Sure, I will prepare a mood board with subway tiles.
    Client: Also, the faucet in the bathroom needs to be gold.
    Designer: Understood. Gold faucet. I'll order that.
    `;

  // Update transcript if it was pending
  await prisma.meetingRecording.update({
      where: { id: recordingId },
      data: { transcript }
  });

  // AI Summary & Extraction
  if (!process.env.OPENAI_API_KEY) {
      // Mock response
      await prisma.meetingRecording.update({
          where: { id: recordingId },
          data: {
              summary: "Mock Summary: Discussed kitchen tiles and bathroom fixtures.",
              actionItemsJson: [
                  { title: "Prepare mood board with subway tiles", assignee: "Designer", dueDate: "Next Tuesday" },
                  { title: "Order gold faucet", assignee: "Designer", dueDate: "ASAP" }
              ]
          }
      });
      return;
  }

  try {
      const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
              { role: "system", content: "You are a project manager assistant. Summarize the meeting and extract action items as JSON." },
              { role: "user", content: `Transcript:\n${transcript}\n\nProvide a JSON response with keys: summary (string), actionItems (array of objects with title, assignee, dueDate).` }
          ],
          response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (content) {
          const result = JSON.parse(content);
          await prisma.meetingRecording.update({
              where: { id: recordingId },
              data: {
                  summary: result.summary,
                  actionItemsJson: result.actionItems
              }
          });
      }
  } catch (error) {
      console.error("AI Processing Error:", error);
      throw new Error("Failed to process recording with AI");
  }
}
