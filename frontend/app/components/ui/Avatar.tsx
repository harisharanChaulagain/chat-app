import React from 'react';
import clsx from 'clsx';

type AvatarProps = {
    src: string;
    alt?: string;
    isOnline?: boolean;
    size?: number; 
};

const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = 'User Avatar',
    isOnline = false,
    size = 48, 
}) => {
    return (
        <div className="relative inline-block" style={{ width: size, height: size }}>
            <img
                src={src}
                alt={alt}
                className="rounded-full object-cover w-full h-full"
            />
            <span
                className={clsx(
                    'absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white',
                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                )}
            />
        </div>
    );
};

export default Avatar;
