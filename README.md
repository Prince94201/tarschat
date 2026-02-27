# TarsChat

TarsChat is a modern, real-time chat application built with Next.js, Convex, and Tailwind CSS. It provides a seamless communication experience with support for both 1-on-1 and group conversations.

## Features

- **Real-time Messaging:** Instant message delivery and synchronization across devices using Convex.
- **1-on-1 & Group Chats:** Create private conversations or group chats with multiple participants.
- **Typing Indicators:** See when others are typing in real-time.
- **Read Receipts:** Track which messages have been read and view unread message counts.
- **Message Management:** Support for sending, reacting to, and deleting messages.
- **Conversation Management:** Functionality to seamlessly delete entire conversations.
- **Authentication:** Secure user authentication managed by Clerk.
- **Responsive UI:** Beautiful, accessible, and responsive interface using Tailwind CSS and shadcn/ui.

## Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/)
- **Backend & Database:** [Convex](https://convex.dev/) (Real-time backend as a service)
- **Authentication:** [Clerk](https://clerk.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)

## Getting Started

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd tarschat
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root directory and add the necessary environment variables for Convex and Clerk. You typically get these by setting up projects in their respective dashboards:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Real-time Backend
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

### Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.
