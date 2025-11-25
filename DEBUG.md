# Debugging HTTP 500 Error

## Steps to Debug

1. **Check the terminal where `pnpm dev` is running**
   - Look for red error messages
   - The actual error will be logged there

2. **Common Causes:**

   a. **Database Connection Error**
      - Error: `POSTGRES_URL is not defined` or connection refused
      - Fix: Set `POSTGRES_URL` in `.env.local` or disable Lea agent
   
   b. **Missing OpenAI API Key**
      - Error: API key validation failed
      - Fix: Set `OPENAI_API_KEY` or the agent will use AI Gateway
   
   c. **Import/Module Error**
      - Error: Cannot find module or import error
      - Fix: Run `pnpm install` again

3. **Quick Test - Disable Lea Agent**

   Add to `.env.local`:
   ```
   USE_LEA_AGENT=false
   ```
   
   Then restart the server. If it works, the issue is with the Lea agent setup.

4. **Check Browser Console**
   - Open DevTools (F12)
   - Check Console tab for client-side errors
   - Check Network tab to see which request is failing

5. **Test Individual Endpoints**

   ```bash
   # Test admin API
   curl http://localhost:3000/api/admin/tools
   
   # Test chat API (will need auth)
   curl http://localhost:3000/api/chat
   ```

## Current Error Handling

The code now has:
- ✅ Try-catch around database queries
- ✅ Fallback to empty configs if DB fails
- ✅ Fallback to AI Gateway if OpenAI fails
- ✅ Graceful degradation to original chat

If you're still seeing 500 errors, the error should be logged in the terminal.

