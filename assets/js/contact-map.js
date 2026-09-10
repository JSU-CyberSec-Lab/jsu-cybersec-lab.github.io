(function () {
    const mapContainer = document.getElementById('contactMap');
    const config = window.JSU_AMAP_CONFIG;
    const mapCopy = () => document.documentElement.lang === 'en'
        ? {
            unavailable: 'Map temporarily unavailable',
            fallback: 'Use “View on Map” below to open Amap.',
            markerTitle: 'Teaching Building 12, Room B609, Jishou University',
            building: 'Teaching Building 12, Jishou University',
            group: 'Cybersecurity Research Lab · B609'
        }
        : {
            unavailable: '地图暂时无法加载',
            fallback: '请通过下方“在地图中查看”打开高德地图。',
            markerTitle: '吉首大学第十二教学楼 B609',
            building: '吉首大学第十二教学楼',
            group: '网络与信息安全课题组 · B609'
        };

    let marker;
    let infoWindow;

    const infoWindowContent = () => {
        const copy = mapCopy();
        return [
            '<div class="amap-location-info">',
            `<strong>${copy.building}</strong>`,
            `<span>${copy.group}</span>`,
            '</div>'
        ].join('');
    };

    if (!mapContainer || !config) return;

    const showError = () => {
        const copy = mapCopy();
        mapContainer.classList.add('has-error');
        mapContainer.innerHTML = [
            '<div class="contact-map-error">',
            `<strong>${copy.unavailable}</strong>`,
            `<span>${copy.fallback}</span>`,
            '</div>'
        ].join('');
    };

    const hasConfiguredCredentials = config.key
        && config.securityJsCode
        && !config.key.startsWith('YOUR_')
        && !config.securityJsCode.startsWith('YOUR_');

    if (!hasConfiguredCredentials) {
        showError();
        return;
    }

    const initializeMap = () => {
        if (!window.AMap) {
            showError();
            return;
        }

        try {
            mapContainer.innerHTML = '';

            const map = new AMap.Map(mapContainer, {
                center: config.center,
                zoom: config.zoom,
                viewMode: '2D',
                resizeEnable: true,
                scrollWheel: false,
                mapStyle: 'amap://styles/normal'
            });

            marker = new AMap.Marker({
                position: config.center,
                title: mapCopy().markerTitle,
                anchor: 'bottom-center',
                content: '<span class="amap-location-marker" aria-hidden="true"><span></span></span>'
            });

            infoWindow = new AMap.InfoWindow({
                anchor: 'bottom-center',
                offset: new AMap.Pixel(0, -42),
                content: infoWindowContent()
            });

            map.add(marker);
            marker.on('click', () => infoWindow.open(map, config.center));
        } catch (error) {
            showError();
        }
    };

    window._AMapSecurityConfig = {
        securityJsCode: config.securityJsCode
    };

    const apiScript = document.createElement('script');
    apiScript.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(config.key)}`;
    apiScript.async = true;
    apiScript.onload = initializeMap;
    apiScript.onerror = showError;
    document.head.appendChild(apiScript);

    document.addEventListener('i18n:change', () => {
        if (marker && infoWindow) {
            marker.setTitle(mapCopy().markerTitle);
            infoWindow.setContent(infoWindowContent());
        } else if (mapContainer.classList.contains('has-error')) {
            showError();
        }
    });
})();
