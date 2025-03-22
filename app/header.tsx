'use client'

import { SignInButton, UserButton } from "@clerk/nextjs"
import { Authenticated, Unauthenticated } from "convex/react"

export function Header() {
  return <div className="py-4">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center gap-4 text-2xl">
        AI Books
      </div>

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