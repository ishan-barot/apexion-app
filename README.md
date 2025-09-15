# Apexion

Apexion is a smart productivity hub I built because I was tired of constantly switching between various apps for task management and Pomodoro timers. This tool combines everything you need to stay productive:

- **Task Management**: Create tasks with categories and due dates.
- **Customizable Pomodoro Timer**: Integrates with your tasks for focused work sessions.
- **Calendar View**: See upcoming tasks at a glance to plan effectively.
- **Analytics**: Track your productivity with insights on completion rates and time spent.
- **Themes**: Enjoy light/dark modes and custom color options for a personalized look.

## Tech Stack
- Next.js 14 with App Router
- PostgreSQL with Prisma
- Next-Auth for authentication
- Tailwind for styling
- Radix UI components

## Getting Started
Clone the repository and install dependencies:
git clone https://github.com/yourusername/apexion.git
cd apexion/app
yarn install

Set up your environment variables in `.env`:
DATABASE_URL="your_postgres_url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_key"

Run the database migrations:
yarn prisma generate
yarn prisma db push

Start the development server:
yarn dev

## API Routes
Key functionality is handled via API routes:
- `/api/tasks` - CRUD operations for tasks
- `/api/subjects` - Managing study subjects
- `/api/timer-sessions` - Tracking Pomodoro sessions
- `/api/dashboard` - Productivity metrics
- `/api/auth` - Next-Auth handlers

## Database Schema
Using Prisma with these main models:
- User (authentication details)
- Task (main todo items)
- Subject (task categories)
- TimerSession (Pomodoro tracking)

Refer to `prisma/schema.prisma` for the full schema.

## Deployment
Designed for deployment on Vercel. Connect your PostgreSQL database and configure the environment variables.

## Notes
- The theme system became complex due to support for both standard and custom themes.
- The Pomodoro timer uses browser notifications (requires permissions).
- The calendar view may experience performance issues with a large number of tasks.
- Data validation on the frontend could be improved but is functional for now.

## Contributing
Feel free to open issues or submit pull requests. This started as a personal project, but I’m eager to make it better with community input.

I built Apexion because existing productivity apps were either too expensive or lacked the specific features I needed. I hope others find it useful too. Thank you for checking it out!
