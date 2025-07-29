import DOMPurify from 'dompurify';

export function cleanHtml(html) {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'b', 'i', 'u', 's', 'strong', 'em', 'blockquote',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'a',
            'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'iframe'
        ],
        ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'target', 'rel', 'style', 'width', 'height', 'colspan', 'rowspan', 'frameborder', 'allow', 'allowfullscreen'
        ],
        // Để bảo vệ thêm, chỉ cho phép nhúng iframe từ các nguồn tin cậy (ví dụ: youtube, vimeo)
        ADD_URI_SAFE_ATTR: ['src'],
        FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onmouseenter', 'onmouseleave'],
        FORBID_TAGS: ['script', 'style', 'object', 'embed', 'form', 'input', 'button']
    });
    
}
// Hàm chuyển oembed sang iframe cho YouTube
export function oembedToIframe(html) {
    if (!html) return '';
    return html.replace(/<oembed url="([^"]+)"[^>]*><\/oembed>/g, (match, url) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let embedUrl = url;
            // Xử lý link youtube.com/watch?v=...
            if (url.includes('watch?v=')) {
                // Lấy id video
                const [base, params] = url.split('watch?v=');
                const [videoId, ...rest] = params.split('&');
                let query = rest.length ? '&' + rest.join('&') : '';
                // Nếu có thêm ? phía sau, chuyển thành ?
                if (query && !query.startsWith('?')) query = '?' + query.slice(1);
                embedUrl = `${base}embed/${videoId}${query}`;
            }
            // Xử lý link youtu.be/...
            else if (url.includes('youtu.be/')) {
                const [base, params] = url.split('youtu.be/');
                const [videoId, ...rest] = params.split('?');
                let query = rest.length ? '?' + rest.join('?') : '';
                embedUrl = `https://www.youtube.com/embed/${videoId}${query}`;
            }
            return `<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
        return '';
    });
}
