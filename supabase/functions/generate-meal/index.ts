// supabase:allow-unauthenticated
// @ts-nocheck
// deno-lint-ignore-file

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userInput, userProfile, inventory } = await req.json()

    // Get the OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const systemPrompt = `
You are a meal planning assistant for student-athletes. Create quick, nutritious meals based on available ingredients.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Available Ingredients:
${inventory.map(item => `- ${item.name} (${item.category})`).join('\n')}

Respond with a JSON object containing:
{
  "meal": {
    "name": "Meal Name",
    "time": "Prep time in minutes",
    "ingredients": ["ingredient1", "ingredient2"],
    "instructions": "Step-by-step cooking instructions",
    "nutrition": {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  },
  "text": "Conversational response explaining the meal"
}
`

    // Call OpenAI API using fetch (newer approach)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Using gpt-3.5-turbo for lower cost
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'OpenAI API error', details: errorData }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const completion = await response.json()
    const aiResponse = completion.choices[0].message.content

    // Try to parse the AI response as JSON
    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
    } catch (e) {
      // If parsing fails, return a structured response
      parsedResponse = {
        text: aiResponse,
        meal: null
      }
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 