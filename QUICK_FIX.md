# Quick Fix for HTTP 500 Error

The 500 error is likely due to database connection issues. Here are quick fixes:

## Option 1: Disable Lea Agent Temporarily

Add to `.env.local`:
```
USE_LEA_AGENT=false
```

This will use the original chat implementation which doesn't require database access.

## Option 2: Set Up Database

1. Install PostgreSQL locally or use a cloud service
2. Create a database
3. Update `.env.local`:
```
POSTGRES_URL=postgresql://user:password@localhost:5432/lea
```
4. Run migration:
```bash
pnpm db:migrate
```

## Option 3: Check Server Logs

The server should show the actual error in the terminal. Look for:
- Database connection errors
- Missing environment variables
- Import errors

## Current Status

The code now has error handling that:
- ✅ Falls back gracefully if database isn't available
- ✅ Uses AI Gateway if OpenAI key isn't set
- ✅ Returns empty configs if database query fails

Try refreshing the page - it should work now with the improved error handling!

