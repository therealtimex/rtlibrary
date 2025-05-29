class MediaSlider {
    constructor(containerId, mediaUrls) {
        this.containerId = containerId;
        this.mediaUrls   = Array.isArray(mediaUrls) ? mediaUrls : [];
        this.init();
    }

    /* ---------- life‑cycle ---------- */
    init() {
        this.injectStyles();
        this.createSlider();
        this.createFullscreenLayer();   // << NEW
        this.initializeSwiper();
    }

    /* ---------- helpers ---------- */
    injectStyles() {
        const styles = `
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css">
            <style>
                /* --- slider --- */
                .swiper{width:100%;height:100%;margin:auto;border-radius:10px;box-shadow:0 0 2px var(--color_theme_shadow)}
                .swiper-slide{display:flex;align-items:center;justify-content:center;background:var(--color_theme_surface)}
                .swiper-slide img{max-width:100%;max-height:100%;object-fit:contain;cursor:pointer}
                .swiper-slide audio,.swiper-slide video{max-width:100%}
                .swiper-slide iframe{width:100%;height:100%;border:none}
                .document-viewer{width:100%;height:100%;overflow:auto}
                .swiper-button-next,.swiper-button-prev{
                    background:var(--color_theme_background);padding:10px;border-radius:50%;
                    color:var(--color_theme_text_primary);width:25px;height:25px;transition:.3s
                }
                .swiper-button-next:hover,.swiper-button-prev:hover{background:var(--color_theme_surface);transform:scale(1.1)}
                .swiper-button-next::after,.swiper-button-prev::after{font-size:20px;font-weight:700}

                /* --- fullscreen overlay (NEW) --- */
                .media-fullscreen{
                    position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
                    background:rgba(0,0,0,.9);z-index:9999;opacity:0;visibility:hidden;transition:opacity .25s;
                }
                .media-fullscreen.active{opacity:1;visibility:visible}
                .media-fullscreen img{max-width:90vw;max-height:90vh;object-fit:contain}
                .media-fullscreen .close-btn{
                    position:absolute;top:16px;right:20px;font-size:32px;font-weight:700;
                    color:#fff;line-height:1;cursor:pointer;user-select:none
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    detectMediaType(url) {
        const ext = url.split('.').pop().toLowerCase();
        const map = {jpg:'image',jpeg:'image',png:'image',gif:'image',webp:'image',avif:'image',
                     mp3:'audio',m4a:'audio',wav:'audio',ogg:'audio',
                     mp4:'video',webm:'video',ogv:'video',
                     pdf:'pdf',docx:'office',xlsx:'office',pptx:'office'};
        return map[ext] || 'unknown';
    }

    createMediaElement(url) {
        if (!url) {
            return `<div style="display:flex;align-items:center;justify-content:center;height:40vh;font-weight:bold;color:#666;">📄 No documents 📋</div>`;
        }
        const type = this.detectMediaType(url);
        switch (type){
            case 'image': return `<img src="${url}" alt="Slide">`;
            case 'audio': return `<audio controls><source src="${url}" type="audio/${url.split('.').pop()}"></audio>`;
            case 'video': return `<video controls width="100%"><source src="${url}" type="video/${url.split('.').pop()}"></video>`;
            default     : return `<iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true"></iframe>`;
        }
    }

    /* ---------- DOM creation ---------- */
    createSlider() {
        const host = document.getElementById(this.containerId);
        if (this.mediaUrls.length === 0){
            host.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:40vh;font-weight:bold;color:#666;">📄 No documents 📋</div>';
            return;
        }

        host.innerHTML = `
            <div class="swiper">
                <div class="swiper-wrapper">
                    ${this.mediaUrls.map(u => `<div class="swiper-slide">${this.createMediaElement(u)}</div>`).join('')}
                </div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            </div>
        `;
    }

    /* ---------- fullscreen layer ---------- */
    createFullscreenLayer() {
        // add overlay once per page
        if (document.getElementById('mediaFullscreenOverlay')) return;

        const layer = document.createElement('div');
        layer.id  = 'mediaFullscreenOverlay';
        layer.className = 'media-fullscreen';
        layer.innerHTML = `
            <span class="close-btn">&times;</span>
            <img src="" alt="fullscreen">
        `;
        document.body.appendChild(layer);

        // close actions
        layer.querySelector('.close-btn').onclick =
        layer.onclick = e => { if (e.target === layer || e.target.classList.contains('close-btn')) layer.classList.remove('active'); };
    }

    showFullscreen(src) {
        const overlay = document.getElementById('mediaFullscreenOverlay');
        if (!overlay) return;
        overlay.querySelector('img').src = src;
        overlay.classList.add('active');
    }

    /* ---------- Swiper init & image listeners ---------- */
    initializeSwiper() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js';
        script.onload = () => {
            new Swiper('.swiper',{
                loop:true, autoplay:false, effect:'fade', speed:900,
                navigation:{nextEl:'.swiper-button-next', prevEl:'.swiper-button-prev'},
                fadeEffect:{crossFade:true}, preloadImages:true, watchSlidesProgress:true
            });

            /* add tap handler to every slide image (NEW) */
            document.querySelectorAll(`#${this.containerId} .swiper-slide img`)
                    .forEach(img => img.addEventListener('click', () => this.showFullscreen(img.src)));
        };
        document.body.appendChild(script);
    }
}
