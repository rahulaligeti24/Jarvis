const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const generateResponse = async (context, userQuery) => {
  try {
    if (!userQuery) throw new Error("User query is required");

    // Use gemini-pro-vision which is more stable
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const systemPrompt = context 
      ? `You are an intelligent decision support assistant. Based on the following relevant past conversations and decisions, provide thoughtful guidance.\n\nRelevant Context:\n${context}`
      : "You are an intelligent decision support assistant. Provide thoughtful guidance.";

    const fullPrompt = `${systemPrompt}\n\nUser Query: ${userQuery}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    return {
      success: true,
      response: responseText
    };
  } catch (err) {
    console.error("LLM generation failed:", err.message);
    
    // Fallback: Return a structured response based on context
    return {
      success: true,
      response: generateFallbackResponse(context, userQuery),
      fallback: true
    };
  }
};

// Fallback response generator when API fails
function generateFallbackResponse(context, userQuery) {
  if (context) {
    return `Based on similar past decisions: ${context.substring(0, 200)}... \n\nFor your current query: "${userQuery}", consider the patterns from previous conversations above.`;
  }
  return `Assistant: I'd be happy to help with "${userQuery}". Please provide more context or let me learn from your decisions to give better recommendations.`;
}

module.exports = { generateResponse };