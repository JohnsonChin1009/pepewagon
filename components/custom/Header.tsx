"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Sidebar from "@/components/custom/Sidebar";

// Define ethereum window type
declare global {
    interface Window {
        ethereum?: any;
    }
}

export default function Header() {
    const [account, setAccount] = useState<string>("");
    const [isConnecting, setIsConnecting] = useState<boolean>(false);

    const checkIfWalletIsConnected = async (): Promise<void> => {
        try {
            const { ethereum } = window;
            if (!ethereum) {
                return;
            }

            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0) {
                setAccount(accounts[0]);
            }
        } catch (error) {
            console.error("Error checking wallet connection:", error);
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const connectWallet = async (): Promise<void> => {
        try {
            setIsConnecting(true);
            const { ethereum } = window;
            
            if (!ethereum) {
                alert("Please install MetaMask!");
                return;
            }

            const accounts = await ethereum.request({
                method: "eth_requestAccounts"
            });

            setAccount(accounts[0]);
        } catch (error) {
            console.error("Error connecting wallet:", error);
        } finally {
            setIsConnecting(false);
        }
    };

    const formatAddress = (address: string): string => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <>
            <header className="border-b border-white text-white flex justify-between items-center px-4 lg:px-10 py-3">
                <div>
                    <Sidebar />
                </div>
                <div>
                    <Button 
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="min-w-[160px]"
                    >
                        {isConnecting ? (
                            "Connecting..."
                        ) : account ? (
                            formatAddress(account)
                        ) : (
                            "Connect Wallet"
                        )}
                    </Button>
                </div>
            </header>
        </>
    );
}