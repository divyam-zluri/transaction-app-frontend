import React from 'react';
import { ReactNode, MouseEventHandler } from 'react';

interface OverlayProps {
    children: ReactNode;
    onClose: MouseEventHandler<HTMLButtonElement>;
}

export default function Overlay({ children, onClose }: OverlayProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-96">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    onClick={onClose}
                >
                    ✖
                </button>
                {children}
            </div>
        </div>
    );
}
