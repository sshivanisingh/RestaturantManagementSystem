"use client"

  import { redirect } from "next/navigation"
 

export default function HomePage() {
  return (
    <div className="">
       {redirect("/resturent")}
    </div>
  )
}

