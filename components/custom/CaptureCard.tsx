// components/custom/CaptureCard.tsx
import React from 'react';
import { Camera, CheckCircle, Clock, User, Loader2 } from 'lucide-react';

interface CaptureCardProps {
    imageUrl: string;
    title?: string;
    timestamp?: string;
    verificationCount: number;
    verified: boolean;
    contributor?: string;
    onUpload?: () => void;
    onVerify?: () => void;
    loading?: boolean;
    networkTheme?: 'purple' | 'blue'; // Add this prop
}

export const CaptureCard: React.FC<CaptureCardProps> = ({
    imageUrl,
    title,
    timestamp,
    verificationCount,
    verified,
    contributor,
    onUpload,
    onVerify,
    loading = false,
    networkTheme = 'blue' // Default to blue theme
}) => {
    // Get theme colors based on network
    const themeColors = {
        primary: networkTheme === 'purple' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-blue-500 hover:bg-blue-600',
        secondary: networkTheme === 'purple' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700',
        verified: networkTheme === 'purple' ? 'bg-purple-500/90' : 'bg-blue-500/90',
        text: networkTheme === 'purple' ? 'text-purple-700' : 'text-blue-700'
    };

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            {/* Image Container */}
            <div className="relative aspect-[4/3]">
                <img
                    src={imageUrl}
                    alt={title || "Capture"}
                    className="w-full h-full object-cover"
                />
                
                {/* Verification Badge */}
                {verified && (
                    <div className={`absolute top-2 right-2 ${themeColors.verified} backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verified
                    </div>
                )}

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className={`w-8 h-8 animate-spin ${themeColors.text}`} />
                            <span className={`text-sm font-medium ${themeColors.text}`}>Processing...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title and Timestamp */}
                <div className="mb-3">
                    {title && (
                        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                    )}
                    {timestamp && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{timestamp}</span>
                        </div>
                    )}
                </div>

                {/* Metadata */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{verificationCount} verifications</span>
                        </div>
                        {contributor && (
                            <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px]" title={contributor}>
                                    {contributor.substring(0, 6)}...{contributor.substring(38)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                    {onUpload && (
                        <button
                            onClick={onUpload}
                            disabled={loading}
                            className={`w-full px-4 py-2 text-white rounded-lg font-medium
                                     transition-colors duration-200 disabled:opacity-50
                                     disabled:cursor-not-allowed flex items-center justify-center gap-2
                                     ${themeColors.primary}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                "Upload to Network"
                            )}
                        </button>
                    )}
                    
                    {onVerify && !verified && (
                        <button
                            onClick={onVerify}
                            disabled={loading}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg
                                     font-medium hover:bg-gray-50 transition-colors duration-200
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Verify Capture
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};