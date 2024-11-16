import Header from "@/components/custom/Header"
import { Button } from "@/components/ui/button"

export default function HomePage() {
    return (
        <>
            <Header />
            <div className="py-10">
                <Button>Upload Picture</Button>
            </div>
        </>
    )
}