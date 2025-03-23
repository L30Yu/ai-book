'use client'

import { SignInButton, UserButton } from "@clerk/nextjs"
import { Authenticated, Unauthenticated } from "convex/react"
import Link from 'next/link';

export function Header() {
  return <div className="py-4">
    <div className="container mx-auto flex justify-between items-center">
      <Link href="/">
        <span className="cursor-pointer font-bold text-2xl">
        AI Books
        </span>
      </Link>

      <div>
        <Unauthenticated>
          <SignInButton />
        </Unauthenticated>
        <Authenticated>
            <UserButton />
        </Authenticated>
      </div>
    </div>
  </div>
}