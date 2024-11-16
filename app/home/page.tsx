// app/home/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from "@/components/custom/Header";
import { CaptureCard } from "@/components/custom/CaptureCard";
import { Camera, MapPin } from 'lucide-react';

const PEPEWAGON_ADDRESS = "0x81E6E2746CDDd8Faa30B859CBF7c62Cdf0deD014";

const SCROLL_SEPOLIA_CONFIG = {
    chainId: '0x8274f', // 534351 in hex
    chainName: 'Scroll Sepolia',
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://sepolia-rpc.scroll.io'],
    blockExplorerUrls: ['https://sepolia.scrollscan.com']
} as const;

const QSNCC_COORDINATES = {
    latitude: 13.7247,
    longitude: 100.5595,
    contractLatitude: 13724700,
    contractLongitude: 100559500
} as const;

const IPFS_IMAGES = [
    "https://bafybeibc4u5aftiueygs3774lsgf7bsazit6blk44hrcgklowox7n6zrd4.ipfs.w3s.link/pepe3.jpg",
    "https://bafybeicbgbrr7k3axhi3saxaamkfzhjdfmrawmjo7ymkto6afvm2xcvhum.ipfs.w3s.link/pepe12.jpg",
    "https://bafybeif2hrkvnkwdvqbtd3gpbq5gdhe6fq4o6fkip2nju5jguomj732v4e.ipfs.w3s.link/pepe10.jpg"
] as const;

interface Capture {
    id: string;
    ipfsHash: string;
    timestamp: string;
    verificationCount: number;
    verified: boolean;
    contributor: string;
}

declare global {
    interface Window {
        ethereum?: any;
    }
}

// If that doesn't work, we can use this alternative
const getProvider = () => {
    if (!window.ethereum) throw new Error("MetaMask is not installed");
    return new ethers.providers.Web3Provider(window.ethereum);
};

export default function HomePage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [captures, setCaptures] = useState<Capture[]>([]);
    const [totalCaptures, setTotalCaptures] = useState<string>("0");
    const [activeUpload, setActiveUpload] = useState<number | null>(null);
    const [walletConnected, setWalletConnected] = useState<boolean>(false);
    const [currentAccount, setCurrentAccount] = useState<string>("");
    const [networkError, setNetworkError] = useState<string>("");

    const switchToScrollSepolia = async () => {
        try {
            setNetworkError("");
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SCROLL_SEPOLIA_CONFIG.chainId }],
            });
        } catch (switchError: any) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: SCROLL_SEPOLIA_CONFIG.chainId,
                            chainName: SCROLL_SEPOLIA_CONFIG.chainName,
                            nativeCurrency: SCROLL_SEPOLIA_CONFIG.nativeCurrency,
                            rpcUrls: SCROLL_SEPOLIA_CONFIG.rpcUrls,
                            blockExplorerUrls: SCROLL_SEPOLIA_CONFIG.blockExplorerUrls
                        }],
                    });
                } catch (addError: any) {
                    setNetworkError("Failed to add Scroll Sepolia network");
                    throw addError;
                }
            } else {
                setNetworkError("Failed to switch to Scroll Sepolia network");
                throw switchError;
            }
        }
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert("Please install MetaMask!");
                return;
            }

            await switchToScrollSepolia();
            
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            const account = accounts[0];
            setCurrentAccount(account);
            setWalletConnected(true);
            await loadCaptures();
            return account;
        } catch (error: any) {
            console.error("Failed to connect wallet:", error);
            setNetworkError(error.message);
            return null;
        }
    };

    const getIpfsHash = (url: string): string => {
        return url.split('/')[3];
    };

    const uploadToScroll = async (ipfsUrl: string, index: number) => {
        try {
            setLoading(true);
            setActiveUpload(index);
            setNetworkError("");

            if (!window.ethereum) {
                throw new Error("Please install MetaMask!");
            }

            const provider = await getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(PEPEWAGON_ADDRESS, [
                "function addCapture(string memory _ipfsHash, int256 _latitude, int256 _longitude) public returns (bytes32)"
            ], signer);

            const ipfsHash = getIpfsHash(ipfsUrl);
            const tx = await contract.addCapture(
                ipfsHash,
                QSNCC_COORDINATES.contractLatitude,
                QSNCC_COORDINATES.contractLongitude,
                { gasLimit: 3000000 }
            );

            await tx.wait();
            await loadCaptures();

        } catch (error: any) {
            console.error("Upload error:", error);
            setNetworkError(error.message);
        } finally {
            setLoading(false);
            setActiveUpload(null);
        }
    };

    const verifyCapture = async (captureId: string) => {
        try {
            if (!window.ethereum) {
                throw new Error("Please install MetaMask!");
            }

            const provider = await getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(PEPEWAGON_ADDRESS, [
                "function verifyCapture(bytes32 _captureId) public"
            ], signer);

            const tx = await contract.verifyCapture(captureId, { gasLimit: 3000000 });
            await tx.wait();
            await loadCaptures();

        } catch (error: any) {
            console.error("Verification error:", error);
            setNetworkError(error.message);
        }
    };

    const loadCaptures = async () => {
        try {
            setNetworkError("");
            if (!window.ethereum) return;

            const provider = await getProvider();
            const contract = new ethers.Contract(PEPEWAGON_ADDRESS, [
                "function totalCaptures() public view returns (uint256)",
                "function captures(bytes32) public view returns (string memory ipfsHash, uint256 timestamp, int256 latitude, int256 longitude, address contributor, bool verified, uint256 verificationCount)",
                "event NewCapture(bytes32 indexed captureId, string ipfsHash, int256 latitude, int256 longitude, address indexed contributor)"
            ], provider);

            const total = await contract.totalCaptures();
            setTotalCaptures(total.toString());

            const filter = contract.filters.NewCapture();
            const events = await contract.queryFilter(filter);

            const capturesData = await Promise.all(
                events.map(async (event: any) => {
                    const capture = await contract.captures(event.args?.captureId);
                    return {
                        id: event.args?.captureId,
                        ipfsHash: capture.ipfsHash,
                        timestamp: new Date(Number(capture.timestamp) * 1000).toLocaleString(),
                        verificationCount: Number(capture.verificationCount),
                        verified: capture.verified,
                        contributor: capture.contributor
                    } as Capture;
                })
            );

            setCaptures(capturesData.reverse());

        } catch (error: any) {
            console.error("Error loading captures:", error);
            setNetworkError(error.message);
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            // Check current network
            window.ethereum.request({ method: 'eth_chainId' })
                .then((chainId: string) => {
                    if (chainId !== SCROLL_SEPOLIA_CONFIG.chainId) {
                        switchToScrollSepolia();
                    }
                });

            // Setup event listeners
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setCurrentAccount(accounts[0]);
                    loadCaptures();
                } else {
                    setWalletConnected(false);
                    setCurrentAccount("");
                }
            });

            window.ethereum.on('chainChanged', async (chainId: string) => {
                if (chainId !== SCROLL_SEPOLIA_CONFIG.chainId) {
                    await switchToScrollSepolia();
                }
                window.location.reload();
            });

            // Check for existing connection
            window.ethereum.request({ method: 'eth_accounts' })
                .then((accounts: string[]) => {
                    if (accounts.length > 0) {
                        setCurrentAccount(accounts[0]);
                        setWalletConnected(true);
                        loadCaptures();
                    }
                });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {});
                window.ethereum.removeListener('chainChanged', () => {});
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {networkError && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {networkError}
                    </div>
                )}
                
                {/* Hero Section */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        QSNCC Captures
                    </h1>
                    <div className="flex flex-wrap gap-4 items-center text-gray-500">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{QSNCC_COORDINATES.latitude}°N, {QSNCC_COORDINATES.longitude}°E</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            <span>{totalCaptures} captures</span>
                        </div>
                    </div>

                    {!walletConnected ? (
                        <button
                            onClick={connectWallet}
                            className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium
                                     hover:bg-blue-600 transition-colors duration-200"
                        >
                            Connect to Scroll Sepolia
                        </button>
                    ) : (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-500">Connected to Scroll Sepolia</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                Account: {currentAccount.substring(0, 6)}...{currentAccount.substring(38)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload Section */}
                {walletConnected && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">New Captures</h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {IPFS_IMAGES.map((url, index) => (
                                <CaptureCard
                                    key={index}
                                    imageUrl={url}
                                    title={`Pepe Capture ${index + 1}`}
                                    timestamp={new Date().toLocaleString()}
                                    verificationCount={0}
                                    verified={false}
                                    onUpload={() => uploadToScroll(url, index)}
                                    loading={loading && activeUpload === index}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Captures */}
                {captures.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Captures</h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {captures.map((capture) => (
                                <CaptureCard
                                    key={capture.id}
                                    imageUrl={`https://ipfs.io/ipfs/${capture.ipfsHash}`}
                                    title="Verified Capture"
                                    timestamp={capture.timestamp}
                                    verificationCount={capture.verificationCount}
                                    verified={capture.verified}
                                    contributor={capture.contributor}
                                    onVerify={() => verifyCapture(capture.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {captures.length === 0 && walletConnected && (
                    <div className="text-center py-20">
                        <Camera className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No captures yet</h3>
                        <p className="text-gray-500">Upload your first capture to get started.</p>
                    </div>
                )}
            </main>
        </div>
    );
}