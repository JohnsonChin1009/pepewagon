// app/home/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from "@/components/custom/Header";
import { CaptureCard } from "@/components/custom/CaptureCard";
import { Camera, MapPin, Coins, Network } from 'lucide-react';

// Contract addresses for Polygon zkEVM Cardona
const PEPEWAGON_ADDRESS = "0xEC0Bc9D59A187AA5693084657deC06889A8398bD";
const PEPEWAGON_TOKEN_ADDRESS = "0xAF85A0023fAc623fCE4F20f50BD475C01e6791B1";

// Network configurations
const POLYGON_ZKEVM_CONFIG = {
    chainId: '0x98a', // 2442 in hex
    chainName: 'Polygon zkEVM Cardona',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://rpc.cardona.zkevm-rpc.com'],
    blockExplorerUrls: ['https://cardona-zkevm.polygonscan.com/']
} as const;

const SCROLL_SEPOLIA_CONFIG = {
    chainId: '0x8274f',
    chainName: 'Scroll Sepolia',
    nativeCurrency: {
        name: 'ETH',
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
    const [tokenBalance, setTokenBalance] = useState<string>("0");
    const [isRewardPending, setIsRewardPending] = useState<boolean>(false);
    const [currentNetwork, setCurrentNetwork] = useState<string>("polygon"); // Default to Polygon

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

    const switchNetwork = async (targetNetwork: string) => {
        try {
            setNetworkError("");
            const config = targetNetwork === "polygon" ? POLYGON_ZKEVM_CONFIG : SCROLL_SEPOLIA_CONFIG;

            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: config.chainId }],
                });
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: config.chainId,
                            chainName: config.chainName,
                            nativeCurrency: config.nativeCurrency,
                            rpcUrls: config.rpcUrls,
                            blockExplorerUrls: config.blockExplorerUrls
                        }],
                    });
                } else {
                    throw switchError;
                }
            }
            setCurrentNetwork(targetNetwork);
        } catch (error: any) {
            console.error("Network switch error:", error);
            setNetworkError(error.message);
        }
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert("Please install MetaMask!");
                return null;
            }

            await switchNetwork(currentNetwork);
            
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            const account = accounts[0];
            setCurrentAccount(account);
            setWalletConnected(true);

            await Promise.all([
                loadCaptures(),
                loadTokenBalance()
            ]);

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

            const ipfsHash = getIpfsHash(ipfsUrl);
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

        } catch (error: any) {
            console.error("Upload error:", error);
            setNetworkError(error.message);
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
                loadTokenBalance()
            ]);

        } catch (error: any) {
            console.error("Verification error:", error);
            setNetworkError(error.message);
        } finally {
            setIsRewardPending(false);
        }
    };

    const loadCaptures = async () => {
        try {
            setNetworkError("");
            if (!window.ethereum) return;

            const provider = await getProvider();
            const contract = new ethers.Contract(
                PEPEWAGON_ADDRESS,
                [
                    "function totalCaptures() public view returns (uint256)",
                    "function captures(bytes32) public view returns (string memory ipfsHash, uint256 timestamp, int256 latitude, int256 longitude, address contributor, bool verified, uint256 verificationCount)",
                    "event NewCapture(bytes32 indexed captureId, string ipfsHash, int256 latitude, int256 longitude, address indexed contributor)"
                ],
                provider
            );

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
            window.ethereum.request({ method: 'eth_chainId' })
                .then((chainId: string) => {
                    const requiredChainId = currentNetwork === "polygon" ? 
                        POLYGON_ZKEVM_CONFIG.chainId : 
                        SCROLL_SEPOLIA_CONFIG.chainId;
                    
                    if (chainId !== requiredChainId) {
                        switchNetwork(currentNetwork);
                    }
                });

            window.ethereum.on('accountsChanged', async (accounts: string[]) => {
                if (accounts.length > 0) {
                    setCurrentAccount(accounts[0]);
                    await Promise.all([loadCaptures(), loadTokenBalance()]);
                } else {
                    setWalletConnected(false);
                    setCurrentAccount("");
                    setTokenBalance("0");
                }
            });

            window.ethereum.on('chainChanged', async (chainId: string) => {
                const requiredChainId = currentNetwork === "polygon" ? 
                    POLYGON_ZKEVM_CONFIG.chainId : 
                    SCROLL_SEPOLIA_CONFIG.chainId;
                
                if (chainId !== requiredChainId) {
                    await switchNetwork(currentNetwork);
                }
                window.location.reload();
            });

            window.ethereum.request({ method: 'eth_accounts' })
                .then(async (accounts: string[]) => {
                    if (accounts.length > 0) {
                        setCurrentAccount(accounts[0]);
                        setWalletConnected(true);
                        await Promise.all([loadCaptures(), loadTokenBalance()]);
                    }
                });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {});
                window.ethereum.removeListener('chainChanged', () => {});
            }
        };
    }, [currentNetwork]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {networkError && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {networkError}
                    </div>
                )}

                {/* Network Selector */}
                <div className="mb-6">
                    <div className="flex items-center gap-4">
                        <select
                            value={currentNetwork}
                            onChange={(e) => switchNetwork(e.target.value)}
                            className="block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 bg-white"
                            disabled={loading}
                        >
                            <option value="polygon">Polygon zkEVM Cardona</option>
                            <option value="scroll">Scroll Sepolia</option>
                        </select>
                        <div className={`h-2 w-2 rounded-full ${walletConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                </div>
                
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
                            className={`mt-6 px-6 py-3 text-white rounded-lg font-medium
                                     transition-colors duration-200 ${
                                         currentNetwork === "polygon" 
                                         ? "bg-purple-500 hover:bg-purple-600" 
                                         : "bg-blue-500 hover:bg-blue-600"
                                     }`}
                        >
                            Connect Wallet
                        </button>
                    ) : (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-500">
                                    Connected to {currentNetwork === "polygon" ? "Polygon zkEVM" : "Scroll Sepolia"}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500">
                                Account: {currentAccount.substring(0, 6)}...{currentAccount.substring(38)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Rewards Info */}
                {walletConnected && (
                    <div className={`mb-8 p-4 rounded-lg shadow-sm ${
                        currentNetwork === "polygon" ? "bg-purple-50" : "bg-blue-50"
                    }`}>
                        <h3 className={`font-semibold mb-2 flex items-center gap-2 ${
                            currentNetwork === "polygon" ? "text-purple-900" : "text-blue-900"
                        }`}>
                            <Coins className="h-4 w-4" />
                            Earn PPWG Tokens
                        </h3>
                        <div className={`space-y-1 ${
                            currentNetwork === "polygon" ? "text-purple-700" : "text-blue-700"
                        }`}>
                            <p>• 50 PPWG for each upload</p>
                            <p>• 30 PPWG for each verification</p>
                        </div>
                        {isRewardPending && (
                            <div className={`mt-2 text-sm animate-pulse ${
                                currentNetwork === "polygon" ? "text-purple-600" : "text-blue-600"
                            }`}>
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
                                <CaptureCard
                                    key={index}
                                    imageUrl={url}
                                    title={`Pepe Capture ${index + 1}`}
                                    timestamp={new Date().toLocaleString()}
                                    verificationCount={0}
                                    verified={false}
                                    onUpload={() => uploadToScroll(url, index)}
                                    loading={loading && activeUpload === index}
                                    networkTheme={currentNetwork === "polygon" ? "purple" : "blue"}
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
                                    networkTheme={currentNetwork === "polygon" ? "purple" : "blue"}
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