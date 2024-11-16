import { Button } from "@/components/ui/button";
import BoxReveal from "@/components/ui/box-reveal";
import { MdOutlineSubdirectoryArrowRight } from "react-icons/md";
import { FaGithub } from "react-icons/fa6";


export default function HeroText() {
    return (
      <div className="w-full max-w-lg flex flex-col items-center text-center text-white">
        <BoxReveal boxColor={"#FFFFFF"} duration={1.0}>
          <p className="text-[40px] lg:text-[60px] font-semibold">
            Pepewagon<span className="text-[#FFFFFF]">.</span>
          </p>
        </BoxReveal>
  
        <BoxReveal boxColor={"#5046e6"} duration={0.5}>
          <h2 className="mt-[.5rem] text-[16px] lg:text-[20px]">
            empowering users to{" "}
            <span className="text-[#5046e6] font-bold">map and earn</span>
          </h2>
        </BoxReveal>
  
        <BoxReveal boxColor={"#5046e6"} duration={0.5}>
          <Button className="mt-[1.6rem] bg-[#5046e6] lg:text-[20px] flex items-center space-x-2">
            <MdOutlineSubdirectoryArrowRight />
            <span>Earn Now</span>
          </Button>
        </BoxReveal>

        <div className="pt-5">
            <a href="https://github.com/JohnsonChin1009/pepewagon" target="_blank" ><FaGithub className="text-[32px] hover:text-[#d1d1d1]"/></a>
        </div>
      </div>
    );
  }