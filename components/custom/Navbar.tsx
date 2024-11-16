"use client";

import { useState, useRef, useEffect } from "react";
import { HiMenu } from "react-icons/hi";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const navbarRef = useRef<HTMLElement>(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleClickLink = (targetID: string) => {
        const target = document.getElementById(targetID);
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
            window.history.pushState(null, "", `#${targetID}`);
            if (isOpen) {
                toggleMenu();
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        window.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <nav
            ref={navbarRef}
            className="sticky top-0 flex justify-center bg-[#000000] px-4 py-4 border-b border-white shadow-md z-50 text-white"
        >
            <div className="flex items-center w-full max-w-6xl">
                {/* Mobile Menu Icon */}
                <div className="lg:hidden ml-auto" onClick={toggleMenu}>
                    <HiMenu
                        className={`text-[28px] transform transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                        }`}
                    />
                </div>

                {/* Desktop Links */}
                <nav className="hidden lg:block w-full">
                    <ul className="flex justify-center space-x-10">
                        {links.map((item) => (
                            <li key={item.id} className="text-[20px] hover:font-bold">
                                <Link href={`#${item.url}`} onClick={() => handleClickLink(`${item.url}`)}>
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Mobile Links */}
                <nav
                    className={cn(
                        isOpen
                            ? "absolute top-[100%] left-0 w-full bg-[#000000] z-50 flex justify-center px-4 py-6 border-b"
                            : "hidden"
                    )}
                >
                    <ul className="flex flex-col gap-10 text-center">
                        {links.map((item) => (
                            <li key={item.id}>
                                <Link href={`#${item.url}`} onClick={() => handleClickLink(`${item.url}`)}>
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </nav>
    );
}

const links = [
    {
        id: 1,
        url: "about",
        text: "about",
    },
    {
        id: 2,
        url: "how-it-works",
        text: "how it works",
    },
    {
        id: 3,
        url: "architecture",
        text: "architecture",
    },
    {
        id: 4,
        url: "why-pepewagon",
        text: "why pepewagon",
    },
    {
        id: 5,
        url: "team",
        text: "the team",
    },
];