import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
    variant?: 'text' | 'card' | 'avatar' | 'table';
    width?: string | number;
    height?: string | number;
    count?: number;
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width = '100%',
    height = '20px',
    count = 1,
    className = '',
}) => {
    const skeletons = Array.from({ length: count });

    const getClasses = () => {
        let classes = `skeleton skeleton-${variant} ${className}`;
        return classes;
    };

    const styles: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    if (variant === 'card') {
        return (
            <div className="skeleton-card">
                <div className="skeleton skeleton-avatar" style={{ width: '60px', height: '60px' }}></div>
                <div className="skeleton-content">
                    <div className="skeleton skeleton-text" style={{ width: '80%', height: '16px' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '60%', height: '14px', marginTop: '8px' }}></div>
                </div>
            </div>
        );
    }

    if (variant === 'table') {
        return (
            <div className="skeleton-table">
                {skeletons.map((_, i) => (
                    <div key={i} className="skeleton-table-row">
                        <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '20%' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '20%' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '20%' }}></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            {skeletons.map((_, i) => (
                <div key={i} className={getClasses()} style={styles}></div>
            ))}
        </>
    );
};

export default Skeleton;
