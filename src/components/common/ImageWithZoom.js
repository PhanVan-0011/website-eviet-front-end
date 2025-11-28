import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

const ImageWithZoom = ({ src, zoomSrc, alt = "Không thấy ảnh", icon = false, ...props }) => {
    const [showZoom, setShowZoom] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ left: 0, top: 0 });
    const containerRef = useRef(null);
    const timeoutRef = useRef(null);

    // Kích thước zoom
    const zoomWidth = 200;
    const zoomHeight = 150;

    const updateZoomPosition = useCallback(() => {
        if (!containerRef.current) return;
        
        // Lấy vị trí chính xác của container (ảnh nhỏ) relative to viewport
        const containerRect = containerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Tính toán vị trí: ưu tiên bên phải ảnh nhỏ, ngay sát
        let left = containerRect.right + 2;
        
        // Căn giữa theo chiều cao của ảnh nhỏ
        let top = containerRect.top + (containerRect.height / 2) - (zoomHeight / 2);
        
        // Kiểm tra và điều chỉnh nếu vượt quá màn hình bên phải
        if (left + zoomWidth > viewportWidth - 10) {
            // Đặt bên trái ảnh nhỏ
            left = containerRect.left - zoomWidth - 2;
        }
        
        // Kiểm tra và điều chỉnh nếu vẫn vượt quá màn hình bên trái
        if (left < 10) {
            left = containerRect.right + 2;
            if (left + zoomWidth > viewportWidth - 10) {
                left = viewportWidth - zoomWidth - 10;
            }
        }
        
        // Kiểm tra và điều chỉnh nếu vượt quá màn hình bên dưới
        if (top + zoomHeight > viewportHeight - 10) {
            top = viewportHeight - zoomHeight - 10;
        }
        
        // Kiểm tra và điều chỉnh nếu vượt quá màn hình bên trên
        if (top < 10) {
            top = 10;
        }
        
        setZoomPosition({ left, top });
    }, [zoomWidth, zoomHeight]);

    useEffect(() => {
        if (showZoom) {
            // Cập nhật vị trí ngay lập tức
            updateZoomPosition();
            
            // Cập nhật vị trí khi scroll hoặc resize
            const handleScroll = () => updateZoomPosition();
            const handleResize = () => updateZoomPosition();
            
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleResize);
            
            return () => {
                window.removeEventListener('scroll', handleScroll, true);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [showZoom, updateZoomPosition]);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Cập nhật vị trí trước khi hiển thị
        updateZoomPosition();
        setShowZoom(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowZoom(false);
        }, 50);
    };

    // Kích thước nhỏ (1/3 kích thước gốc: 160x120 -> ~53x40)
    const smallSize = {
        width: '55px',
        height: '45px'
    };

    // Render zoom image using Portal để tránh bị ảnh hưởng bởi overflow của parent
    const renderZoomImage = () => {
        if (!showZoom || !src || icon) return null;
        
        return ReactDOM.createPortal(
            <div
                style={{
                    position: 'fixed',
                    left: `${zoomPosition.left}px`,
                    top: `${zoomPosition.top}px`,
                    zIndex: 99999,
                    width: `${zoomWidth}px`,
                    height: `${zoomHeight}px`,
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    border: '2px solid #fff',
                    pointerEvents: 'none',
                    animation: 'imageZoomFadeIn 0.15s ease-out',
                }}
            >
                <img
                    src={zoomSrc || src}
                    alt={alt}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                    }}
                />
            </div>,
            document.body
        );
    };

    return (
        <>
            <div
                ref={containerRef}
                style={{
                    ...smallSize,
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: '#f8f9fa',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    border: '1px solid #eee',
                    cursor: 'pointer',
                    position: 'relative',
                    ...props.style
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                {...props}
            >
                {icon ? (
                    <i
                        className="fas fa-image"
                        style={{
                            fontSize: 20,
                            color: '#bbb',
                        }}
                    />
                ) : (
                    <img
                        src={src ? src : '/no-image.png'}
                        alt={alt}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'fill',
                            display: 'block',
                        }}
                    />
                )}
            </div>

            {renderZoomImage()}

            <style>{`
                @keyframes imageZoomFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </>
    );
};

export default ImageWithZoom;
