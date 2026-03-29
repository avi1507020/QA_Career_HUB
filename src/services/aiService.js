/**
 * AI Service for QA LinkedIn Post Generation
 * Integrates with Groq API for real generation
 */

export const generatePosts = async (topic, apiKey) => {
  if (!apiKey) throw new Error("Please configure your Groq API Key first.");
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a professional LinkedIn content creator and QA Expert. Your mission is to write 5 highly engaging, high-impact LinkedIn posts that are informative and professional. Each post MUST be 100-150 words long, featuring a strong 'hook' at the start, insightful industry content, bullet points for readability, and 3-5 relevant hashtags. Return exactly 5 posts in a JSON object format: { \"posts\": [\"post1\", \"post2\", ...] }."
          },
          {
            role: "user",
            content: `Write 5 professional LinkedIn posts about this topic: ${topic}. Focus on Quality Assurance, Testing strategies, and professional growth. Keep the tone conversational, expert, and value-driven.`
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Generation failed");
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    const postsArray = content.posts || [];
    
    return postsArray.map((text, index) => ({
      id: `post-${Date.now()}-${index}`,
      content: text,
      selected: false
    }));
  } catch (error) {
    console.error("Groq Generation Error:", error);
    throw error;
  }
};

export const generateImagePrompt = async (postContent, apiKey) => {
  // Static high-quality prompt for dramatic tech visual
  return `A dramatic wide LinkedIn post image, 1200x627 pixels. Split down the middle. Left side shows a clean, organized traditional software testing dashboard with green checkmarks and "PASS" labels in a calm blue-toned environment. Right side shows a chaotic, glitching AI interface with hallucinated text, red warning signs, question marks, and broken neural network visualizations in a dark red-orange toned environment. A bold white crack runs down the center dividing both worlds. At the top center, large bold white text reads "Most teams build AI." At the bottom center, bold text reads "Almost nobody tests it." Modern, editorial, tech-magazine cover aesthetic, dramatic lighting contrast, cinematic feel, no people, no faces, 4K sharp.`;
};

export const checkGroqConnection = async (apiKey) => {
  if (!apiKey) throw new Error("API Key is required");
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) return true;
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Connection failed");
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
};
