"use client";

export default function ComingSoonAlert() {
    return (
        <div className="w-full rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 shadow-sm">
            <p className="font-semibold mb-1">Feature Coming Soon</p>
            <p>
                This feature is still under development, please check back again later
            </p>
        </div>
    );
}
