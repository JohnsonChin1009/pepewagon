// app/home/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import OpenAI from 'openai';
import Header from "@/components/custom/Header";
import { CaptureCard } from "@/components/custom/CaptureCard";
import { Camera, MapPin, Coins, MessageSquare } from 'lucide-react';

// Constants
const PEPEWAGON_ADDRESS = "0x81E6E2746CDDd8Faa30B859CBF7c62Cdf0deD014";
const PEPEWAGON_TOKEN_ADDRESS = "0x74bc37d7B2928E9C8e98f9c27c0423ed44b2D52f";

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

// Hyperbolic client initialization
const hyperbolicClient = new OpenAI({
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcWlsamVmZkBnbWFpbC5jb20iLCJpYXQiOjE3MzE3OTg3Njd9.Clld3oC4p4B6QdXRH173_KnVmPA2ps55C20S75vMlaI',
    baseURL: 'https://api.hyperbolic.xyz/v1'
});

// Interfaces
interface Capture {
    id: string;
    ipfsHash: string;
    timestamp: string;
    verificationCount: number;
    verified: boolean;
    contributor: string;
}

interface ImageAnalysis {
    description?: string;
    error?: string;
}

interface CaptureWithAnalysis extends Capture {
    analysis?: ImageAnalysis;
}

declare global {
    interface Window {
        ethereum?: any;
    }
}

// Helper functions
const getProvider = () => {
    if (!window.ethereum) throw new Error("MetaMask is not installed");
    return new ethers.providers.Web3Provider(window.ethereum);
};

const isErrorWithCode = (error: unknown): error is { code: number } => {
    return typeof error === 'object' && error !== null && 'code' in error && typeof (error as any).code === 'number';
};

const isErrorWithMessage = (error: unknown): error is { message: string } => {
    return typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string';
};

export default function HomePage() {
    // State management
    const [loading, setLoading] = useState<boolean>(false);
    const [capturesWithAnalysis, setCapturesWithAnalysis] = useState<CaptureWithAnalysis[]>([]);
    const [totalCaptures, setTotalCaptures] = useState<string>("0");
    const [activeUpload, setActiveUpload] = useState<number | null>(null);
    const [walletConnected, setWalletConnected] = useState<boolean>(false);
    const [currentAccount, setCurrentAccount] = useState<string>("");
    const [networkError, setNetworkError] = useState<string>("");
    const [tokenBalance, setTokenBalance] = useState<string>("0");
    const [isRewardPending, setIsRewardPending] = useState<boolean>(false);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

    // Define the interface for the API response
    interface HyperbolicResponse {
    content: string;
    role: string;
    }
    // Updated analyzeImage function
    const analyzeImage = async (imageUrl: string): Promise<ImageAnalysis> => {
    try {
        // Create the request body
        const requestBody = {
            model: 'meta-llama/Meta-Llama-3-70B-Instruct',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert at analyzing images. Provide detailed but concise descriptions.'
                },
                {
                    role: 'user',
                    content: `Please analyze this image at ${imageUrl} and provide a brief description of its content, style, and notable features.`
                }
            ]
        };

        // Make direct fetch request to Hyperbolic API
        const response = await fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcWlsamVmZkBnbWFpbC5jb20iLCJpYXQiOjE3MzE3OTg3Njd9.Clld3oC4p4B6QdXRH173_KnVmPA2ps55C20S75vMlaI`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
            description: data.choices[0].message.content || 'No analysis available'
        };
    } catch (error) {
        console.error('Error analyzing image:', error);
        return {
            error: 'Failed to analyze image'
        };
    }
};

    // Network and wallet functions
    const switchToScrollSepolia = async () => {
        try {
            setNetworkError("");
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SCROLL_SEPOLIA_CONFIG.chainId }],
            });
        } catch (error: unknown) {
            if (isErrorWithCode(error) && error.code === 4902) {
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
                } catch (addError: unknown) {
                    if (isErrorWithMessage(addError)) {
                        setNetworkError("Failed to add Scroll Sepolia network");
                    }
                    throw addError;
                }
            } else if (isErrorWithMessage(error)) {
                setNetworkError("Failed to switch to Scroll Sepolia network");
            }
            throw error;
        }
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert("Please install MetaMask!");
                return null;
            }

            await switchToScrollSepolia();

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
            if (!accounts || accounts.length === 0) {
                setNetworkError("No accounts found.");
                return null;
            }

            const account = accounts[0];
            setCurrentAccount(account);
            setWalletConnected(true);

            await Promise.all([
                loadCaptures(),
                loadTokenBalance(),
            ]);

            return account;
        } catch (error: unknown) {
            if (isErrorWithMessage(error)) {
                console.error("Failed to connect wallet:", error.message);
                setNetworkError(error.message);
            } else {
                console.error("Failed to connect wallet:", error);
                setNetworkError("An unknown error occurred.");
            }
            return null;
        }
    };

    // Token and balance functions
    const loadTokenBalance = async () => {
        try {
            if (!window.ethereum || !currentAccount) return;

            const provider = await getProvider();
            const tokenContract = new ethers.Contract(
                PEPEWAGON_TOKEN_ADDRESS,
                [
                    "function balanceOf(address account) public view returns (uint256)",
                    "function symbol() public view returns (string)",
                    "function decimals() public view returns (uint8)"
                ],
                provider
            );

            const balance = await tokenContract.balanceOf(currentAccount);
            const formattedBalance = ethers.utils.formatUnits(balance, 18);
            setTokenBalance(formattedBalance);
        } catch (error) {
            console.error("Error loading token balance:", error);
        }
    };

    // Capture management functions
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
                    } as CaptureWithAnalysis;
                })
            );

            setIsAnalyzing(true);
            const analyzedCaptures = await Promise.all(
                capturesData.map(async (capture) => {
                    const imageUrl = `https://ipfs.io/ipfs/${capture.ipfsHash}`;
                    const analysis = await analyzeImage(imageUrl);
                    return {
                        ...capture,
                        analysis
                    };
                })
            );
    
            setCapturesWithAnalysis(analyzedCaptures.reverse());
            setIsAnalyzing(false);
    
        } catch (error: any) {
            console.error("Error loading captures:", error);
            setNetworkError(error.message);
        }
    };

    const uploadToScroll = async (ipfsUrl: string, index: number) => {
        try {
            setLoading(true);
            setActiveUpload(index);
            setNetworkError("");
            setIsRewardPending(true);

            if (!window.ethereum) {
                throw new Error("Please install MetaMask!");
            }

            const provider = await getProvider();
            const signer = await provider.getSigner();

            const captureContract = new ethers.Contract(
                PEPEWAGON_ADDRESS,
                ["function addCapture(string memory _ipfsHash, int256 _latitude, int256 _longitude) public returns (bytes32)"],
                signer
            );

            const tokenContract = new ethers.Contract(
                PEPEWAGON_TOKEN_ADDRESS,
                ["function transfer(address to, uint256 value) public returns (bool)"],
                signer
            );

            const ipfsHash = ipfsUrl.split('/')[3];

            const tx = await captureContract.addCapture(
                ipfsHash,
                QSNCC_COORDINATES.contractLatitude,
                QSNCC_COORDINATES.contractLongitude,
                { gasLimit: 3000000 }
            );
            await tx.wait();

            const uploadReward = ethers.utils.parseUnits("50", 18);
            const rewardTx = await tokenContract.transfer(currentAccount, uploadReward);
            await rewardTx.wait();

            await Promise.all([
                loadCaptures(),
                loadTokenBalance()
            ]);

        } catch (error: unknown) {
            if (isErrorWithMessage(error)) {
                console.error("Upload error:", error.message);
                setNetworkError(error.message);
            } else {
                console.error("Upload error:", error);
                setNetworkError("An unknown error occurred during upload.");
            }
        } finally {
            setLoading(false);
            setActiveUpload(null);
            setIsRewardPending(false);
        }
    };

    const verifyCapture = async (captureId: string) => {
        try {
            setIsRewardPending(true);

            if (!window.ethereum) {
                throw new Error("Please install MetaMask!");
            }

            const provider = await getProvider();
            const signer = await provider.getSigner();

            const captureContract = new ethers.Contract(
                PEPEWAGON_ADDRESS,
                ["function verifyCapture(bytes32 _captureId) public"],
                signer
            );

            const tokenContract = new ethers.Contract(
                PEPEWAGON_TOKEN_ADDRESS,
                ["function transfer(address to, uint256 value) public returns (bool)"],
                signer
            );

            const tx = await captureContract.verifyCapture(captureId, { gasLimit: 3000000 });
            await tx.wait();

            const verifyReward = ethers.utils.parseUnits("30", 18);
            const rewardTx = await tokenContract.transfer(currentAccount, verifyReward);
            await rewardTx.wait();

            await Promise.all([
                loadCaptures(),
                loadTokenBalance(),
            ]);

        } catch (error: unknown) {
            if (isErrorWithMessage(error)) {
                console.error("Verification error:", error.message);
                setNetworkError(error.message);
            } else {
                console.error("Verification error:", error);
                setNetworkError("An unknown error occurred during verification.");
            }
        } finally {
            setIsRewardPending(false);
        }
    };

    // Effect hooks
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_chainId' })
                .then((chainId: string) => {
                    if (chainId !== SCROLL_SEPOLIA_CONFIG.chainId) {
                        switchToScrollSepolia();
                    }
                });

            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setCurrentAccount(accounts[0]);
                    Promise.all([loadCaptures(), loadTokenBalance()]);
                } else {
                    setWalletConnected(false);
                    setCurrentAccount("");
                    setTokenBalance("0");
                }
            });

            window.ethereum.on('chainChanged', async (chainId: string) => {
                if (chainId !== SCROLL_SEPOLIA_CONFIG.chainId) {
                    await switchToScrollSepolia();
                }
                window.location.reload();
            });

            window.ethereum.request({ method: 'eth_accounts' })
                .then((accounts: string[]) => {
                    if (accounts.length > 0) {
                        setCurrentAccount(accounts[0]);
                        setWalletConnected(true);
                        Promise.all([loadCaptures(), loadTokenBalance()]);
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

    // CaptureCard Component
    const CaptureCardWithAnalysis = ({ 
        imageUrl, 
        title, 
        timestamp, 
        verificationCount, 
        verified, 
        contributor, 
        analysis,
        onUpload,
        onVerify,
        loading 
    }: {
        imageUrl: string;
        title: string;
        timestamp: string;
        verificationCount: number;
        verified: boolean;
        contributor?: string;
        analysis?: ImageAnalysis;
        onUpload?: () => void;
        onVerify?: () => void;
        loading?: boolean;
    }) => {
        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative aspect-video">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{timestamp}</p>
                    
                    {analysis && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                                <p className="text-sm text-gray-600">
                                    {analysis.description || analysis.error}
                                </p>
                            </div>
                        </div>
                    )}

                    {contributor && (
                        <p className="text-sm text-gray-500 mt-2">
                            By: {contributor.substring(0, 6)}...{contributor.substring(38)}
                        </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${verified ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-sm text-gray-500">
                                {verificationCount} verification{verificationCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                        
                        {onUpload && (
                            <button
                                onClick={onUpload}
                                disabled={loading}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                    loading
                                        ? 'bg-gray-200 text-gray-400'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                {loading ? 'Uploading...' : 'Upload'}
                            </button>
                        )}
                        
                        {onVerify && !verified && (
                            <button
                                onClick={onVerify}
                                className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                                Verify
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Main render
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
                        {walletConnected && (
                            <div className="flex items-center gap-2">
                                <Coins className="h-4 w-4" />
                                <span>{Number(tokenBalance).toLocaleString()} PPWG</span>
                            </div>
                        )}
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

                {/* Rewards Info */}
                {walletConnected && (
                    <div className="mb-8 p-4 bg-blue-50 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Coins className="h-4 w-4" />
                            Earn PPWG Tokens
                        </h3>
                        <div className="space-y-1 text-blue-700">
                            <p>• 50 PPWG for each upload</p>
                            <p>• 30 PPWG for each verification</p>
                        </div>
                        {isRewardPending && (
                            <div className="mt-2 text-sm text-blue-600 animate-pulse">
                                Processing reward...
                            </div>
                        )}
                    </div>
                )}

                {/* Upload Section */}
                {walletConnected && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">New Captures</h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {IPFS_IMAGES.map((url, index) => (
                                <CaptureCardWithAnalysis
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
                {capturesWithAnalysis.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Recent Captures
                            {isAnalyzing && (
                                <span className="ml-2 text-sm text-gray-500 animate-pulse">
                                    Analyzing images...
                                </span>
                            )}
                        </h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {capturesWithAnalysis.map((capture) => (
                                <CaptureCardWithAnalysis
                                    key={capture.id}
                                    imageUrl={`https://ipfs.io/ipfs/${capture.ipfsHash}`}
                                    title="Verified Capture"
                                    timestamp={capture.timestamp}
                                    verificationCount={capture.verificationCount}
                                    verified={capture.verified}
                                    contributor={capture.contributor}
                                    analysis={capture.analysis}
                                    onVerify={() => verifyCapture(capture.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {capturesWithAnalysis.length === 0 && walletConnected && (
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