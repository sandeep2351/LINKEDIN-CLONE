import React, { useState } from "react";
import { Share2, ChevronDown } from "lucide-react";

const ShareAction = ({ postUrl, postTitle }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const handleShare = (platform) => {
        const encodedUrl = encodeURIComponent(postUrl);
        const encodedTitle = encodeURIComponent(postTitle);
        let shareUrl;

        switch (platform) {
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case "whatsapp":
                shareUrl = `https://wa.me/?text=${encodedTitle} ${encodedUrl}`;
                break;
            default:
                return;
        }

        window.open(shareUrl, "_blank");
        setDropdownOpen(false); // Close dropdown after sharing
    };

    return (
        <div className="relative">
            <button
                className="flex items-center space-x-1 text-info hover:text-primary"
                onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
                <Share2 size={18} />
                <span>Share</span>
                <ChevronDown size={14} />
            </button>

            {isDropdownOpen && (
                <div className="absolute bg-base-100 shadow-lg rounded p-2 mt-2 right-0 z-10">
                    <button
                        onClick={() => handleShare("facebook")}
                        className="block px-4 py-2 hover:bg-secondary rounded text-left"
                    >
                        Share on Facebook
                    </button>
                    <button
                        onClick={() => handleShare("twitter")}
                        className="block px-4 py-2 hover:bg-secondary rounded text-left"
                    >
                        Share on Twitter
                    </button>
                    <button
                        onClick={() => handleShare("whatsapp")}
                        className="block px-4 py-2 hover:bg-secondary rounded text-left"
                    >
                        Share on WhatsApp
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShareAction;
