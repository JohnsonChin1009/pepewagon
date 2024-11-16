
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/custom/Sidebar";

export default function Header() {
    return (
        <>
            <header className="border-b border-white text-white flex justify-between items-center px-4 lg:px-10 py-3">
                <div>
                    <Sidebar />
                </div>
                <div>
                    <Button>
                        Connect Wallet
                    </Button>
                </div>
            </header>
        </>
    )
}