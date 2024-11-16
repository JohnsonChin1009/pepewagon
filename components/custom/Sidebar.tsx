import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LuMenu } from "react-icons/lu"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { PiSignOutBold } from "react-icons/pi";

export default function Sidebar() {
    return (
        <>
        <Sheet>
      <SheetTrigger asChild>
        <LuMenu className="text-[20px] font-bold"/>
      </SheetTrigger>
      <SheetContent side={"left"}>
        <SheetHeader>
          <SheetTitle className="text-white text-start">Welcome Back, Pepe!</SheetTitle>
        </SheetHeader>

        <Separator/>

        <ul className="text-white font-medium space-y-4 py-12 text-[18px]">
            <li>
                <Link href="/home">Dashboard</Link>
            </li>
            <li>
                <Link href="/profile">Profile</Link>
            </li>
            <li>
                <Link href="/leaderboard">Leaderboard</Link>
            </li>
            <li>
                <Link href="/home/maps">Maps</Link>
            </li>
        </ul>
        <SheetFooter>
            <Link href="/">
            <Button className="font-bold text-red-500">Sign Out<PiSignOutBold /></Button>
            </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
        </>
    )
}