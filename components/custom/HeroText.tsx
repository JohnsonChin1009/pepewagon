import { Button } from "@/components/ui/button";
import BoxReveal from "@/components/ui/box-reveal";
import { MdOutlineSubdirectoryArrowRight } from "react-icons/md";

export default function HeroText() {
    return (
        <>
            <div className="size-full max-w-lg items-center justify-center overflow-hidden text-white">
                <BoxReveal boxColor={"#FFFFFF"} duration={1.0}>
                    <p className="text-[40px] font-semibold">
                    Pepewagon<span className="text-[#FFFFFF]">.</span>
                    </p>
                </BoxReveal>
 
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                    <h2 className="mt-[.5rem] text-[1rem]">
                    empowering users to{" "}
                    <span className="text-[#5046e6] font-bold">map and earn</span>
                    </h2>
                </BoxReveal>
 
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                    <Button className="mt-[1.6rem] bg-[#5046e6]"><MdOutlineSubdirectoryArrowRight />Earn Now</Button>
                </BoxReveal>
    </div>
        </>
    )
}