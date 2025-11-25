# Testing Lea Agent

## 🚀 Quick Start

The development server is running at **http://localhost:3000**

## ✅ What's Been Implemented

1. **Lea Agent** - Autonomous AI agent using AI SDK 6 `ToolLoopAgent`
2. **4 Core Tools**:
   - `search` - Web research (mock, ready for API integration)
   - `filesystem` - File operations (requires approval)
   - `codeExecution` - Code execution (requires approval)
   - `analysis` - Data analysis
3. **Admin Panel** - `/admin` for tool configuration
4. **Tool Approval UI** - Approve/Deny buttons for sensitive operations
5. **Database Migration** - `0008_superb_tana_nile.sql` for tool configuration

## 🧪 Testing Steps

### 1. Set Up Environment Variables

Create a `.env.local` file with:

```bash
# Required
POSTGRES_URL=postgresql://user:password@localhost:5432/lea
AUTH_SECRET=your-secret-key-here
AUTH_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-api-key

# Optional
USE_LEA_AGENT=true  # Set to false to use original chat
```

### 2. Run Database Migration

```bash
pnpm db:migrate
```

### 3. Start the Server

```bash
pnpm dev
```

### 4. Test the Application

#### A. Access the Chat Interface
1. Open http://localhost:3000
2. You'll be redirected to guest authentication
3. Start a new chat

#### B. Test Lea Agent
Try these prompts:
- "What tools do you have available?"
- "Search for information about AI agents"
- "Analyze this data: [1, 2, 3, 4, 5]"
- "What's the weather in San Francisco?"

#### C. Test Tool Approvals
1. Ask Lea to write a file: "Create a file called test.txt with content 'Hello World'"
2. You should see an approval request with Approve/Deny buttons
3. Click Approve to allow the operation

#### D. Test Admin Panel
1. Navigate to http://localhost:3000/admin
2. Enable/disable tools
3. Configure tool settings
4. Changes take effect immediately

## 🔍 Verification Checklist

- [ ] Server starts without errors
- [ ] Can access chat interface
- [ ] Can start a conversation with Lea
- [ ] Tool approval UI appears for filesystem/code tools
- [ ] Admin panel is accessible
- [ ] Can enable/disable tools in admin panel
- [ ] Agent uses configured tools dynamically

## 🐛 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check `POSTGRES_URL` in `.env.local`
- Run `pnpm db:migrate` to create tables

### OpenAI API Error
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits
- The agent falls back to original chat if OpenAI fails

### Tool Approval Not Showing
- Ensure `USE_LEA_AGENT=true` in `.env.local`
- Check browser console for errors
- Verify `addToolApprovalResponse` is passed to components

### Admin Panel Not Accessible
- Ensure you're authenticated (guest or regular user)
- Check `/api/admin/tools` endpoint returns data
- Verify database migration ran successfully

## 📝 Notes

- The agent is enabled by default when `USE_LEA_AGENT` is not set to "false"
- Tool configurations are stored in the `ToolConfig` database table
- File system and code execution tools always require approval for security
- Search and analysis tools can be configured to require approval via admin panel

