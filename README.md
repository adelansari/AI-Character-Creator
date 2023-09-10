This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.



## From Scratch

### Environmental setup:

Create Project:
```sh
npx create-next-app@latest ai-character-creator --typescript --eslint --tailwind
```

Run Shadcn CLI
```sh
npx shadcn-ui@latest init
```

Clerk Authentication
- create an account [here](https://clerk.com/)
- Set Environment Keys in .env
```sh
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aGXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_WFgWXXXXXXXXXXXXXXXX
```

- Install @clerk/nextjs
```sh
npm install @clerk/nextjs
```
- Mount <ClerkProvider />
  Updating app/layout.tsx with <ClerkProvider /> wrapper.
- Protect application
  creating `middleware.ts` file at the root
- build sign-up and sing-in pages.
- Add more environmental variables to .env
  ```sh
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
  ```

Adding button component from shadcn ui:
```sh
npx shadcn-ui@latest add button
```

Adding Dark mode

- installing `next-themes`
```sh
npm i next-themes@latest
```

- creating a theme provider
  components/theme-provider.tsx
  ```sh
  "use client"
 
  import * as React from "react"
  import { ThemeProvider as NextThemesProvider } from "next-themes"
  import { type ThemeProviderProps } from "next-themes/dist/types"
  
  export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
  }
  ```
- Adding the `ThemeProvider` to root layout.
  ```sh
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    {children}
  </ThemeProvider>
  ```
- Adding theme toggle following [this](https://ui.shadcn.com/docs/dark-mode/next)
  ```sh
  npx shadcn-ui@latest add dropdown-menu
  ```
- Adding sheet component
  ```sh
  npx shadcn-ui@latest add sheet
  ```

### Adding Search Filter

Display a form input field
```sh
npx shadcn-ui@latest add input
```

```sh
npm install query-string
```

### Adding category filter
Initializing prisma
```sh
npm i -D prisma
npx prisma init
```
Creating an account with 'planetscale'
Creating DB with prisma and mysql provider
Modifying 'prisma/schema.prisma' file:
```sh
datasource db {
  provider     = "mysql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"
}

generator client {
  provider = "prisma-client-js"
}
```

After `schema.prisma` file is being edited:
```sh
npx prisma generate
npx prisma db push
```

checking db in localhost:
```sh
npx prisma studio
```

Seeding category names
```sh
node scripts/seed.ts
```

Adding character creation form
```sh
npx shadcn-ui@latest add form
```
Adding Textarea
```sh
npx shadcn-ui@latest add form
```

Adding separator
```sh
npx shadcn-ui@latest add separator
```

Adding `Select` component
```sh
npx shadcn-ui@latest add select
```

Setting up Cloudinary for image upload
In `.env` file
```sh
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="CloudNameHere"
```
Installing package:
```sh
npm i next-cloudinary
```