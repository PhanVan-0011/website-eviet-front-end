import React from 'react';

const ImageList = ({ src, alt = "Không thấy ảnh", style = {}, icon = false, ...props }) => (
    <div
        style={{
            width: '90%',
            height: '120px',
            borderRadius: 10,
            overflow: 'hidden',
            background: '#f8f9fa',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            border: '1px solid #eee',
            transition: 'box-shadow 0.2s',
            ...style
        }}
        {...props}
    >
        {icon ? (
            <i
                className="fas fa-image"
                style={{
                    fontSize: 48,
                    color: '#bbb',
                    transition: 'transform 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
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
                    transition: 'transform 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
        )}
    </div>
);

export default ImageList;