if (typeof window.styleElement === 'undefined') { // shitty way to detect if script was already injected, todo: find a better way to do this.
    window.styleElement = null;

    // <executed_on_content_script_loaded>
    chrome.storage.sync.get(['video_title_format'], function ({video_title_format}) {
        // only running something for the css change, as the webRequest listeners should be live now.
        if (video_title_format !== 'default') {
            updateCSS(video_title_format);
        }
    });
    // </executed_on_content_script_loaded>

    chrome.runtime.onMessage.addListener(function (message) {
        Object.keys(message).forEach(function (change) {
            switch (change) {
                case 'preferred_thumbnail_file':
                    updateThumbnails(
                        message[change].newValue === undefined ? 'hq1' : message[change].newValue
                    );
                    break;
                case 'video_title_format':
                    updateCSS(message[change].newValue);
                    break;
            }
        })
    });

    function updateCSS(option) {

        let appendingElement = false;

        if (window.styleElement === null) {
            appendingElement = true;
            window.styleElement = document.createElement('style');
        }

        switch (option) {
            case 'lowercase':
                //language=CSS
                window.styleElement.innerHTML = `
                #video-title,
                .ytp-videowall-still-info-title,
                .large-media-item-metadata > a > h3 > span,
                .media-item-metadata > a > h3 > span,
                .yt-lockup-metadata-view-model__title > span,
                .compact-media-item-headline > span {
                    text-transform: lowercase;
                }
            `;
                break;
            case 'capitalize_first_letter':
                //language=CSS
                window.styleElement.innerHTML = `
                #video-title,
                .ytp-videowall-still-info-title,
                .large-media-item-metadata > a > h3 > span,
                .media-item-metadata > a > h3 > span,
                .yt-lockup-metadata-view-model__title > span,
                .compact-media-item-headline > span {
                    text-transform: lowercase;
                    display: block !important;
                }

                #video-title::first-letter,
                .ytp-videowall-still-info-title::first-letter,
                .large-media-item-metadata > a > h3 > span::first-letter,
                .media-item-metadata > a > h3 > span::first-letter,
                .yt-lockup-metadata-view-model__title > span::first-letter,
                .compact-media-item-headline > span::first-letter {
                    text-transform: uppercase;
                }
            `;
                break;
            case 'capitalise_words':
                //language=CSS
                window.styleElement.innerHTML = `
                #video-title,
                .ytp-videowall-still-info-title,
                .large-media-item-metadata > a > h3 > span,
                .media-item-metadata > a > h3 > span,
                .yt-lockup-metadata-view-model__title > span,
                .compact-media-item-headline > span {
                    text-transform: lowercase;
                    display: block !important;
                }

                #video-title::first-line,
                .ytp-videowall-still-info-title::first-line,
                .large-media-item-metadata > a > h3 > span::first-line,
                .media-item-metadata > a > h3 > span::first-line,
                .yt-lockup-metadata-view-model__title > span::first-line,
                .compact-media-item-headline > span::first-line {
                    text-transform: capitalize;
                }
            `;
                break;
            case 'default':
                window.styleElement.remove();
                window.styleElement = null;
                break;
        }

        if (appendingElement) {
            document.head.appendChild(window.styleElement);
        }
    }

    function updateThumbnails(newImage) {
        let imgElements = document.getElementsByTagName('img');

        for (let i = 0; i < imgElements.length; i++) {
            if (imgElements[i].src.match('https://i9?.ytimg.com/(vi|vi_webp)/.*/(hq1|hq2|hq3|hqdefault|mqdefault|hq720)(_custom_[0-9]+)?.jpg?.*')) {

                let url = imgElements[i].src.replace(/(hq1|hq2|hq3|hqdefault|mqdefault|hq720)(_custom_[0-9]+)?.jpg/, `${newImage}.jpg`);

                if (!url.match('.*stringtokillcache')) {
                    url += '?stringtokillcache'
                }

                imgElements[i].src = url;
            }
        }

        let backgroundImgElements = document.querySelectorAll('.ytp-videowall-still-image, .iv-card-image');

        for (let i = 0; i < backgroundImgElements.length; i++) {
            let styleAttribute = backgroundImgElements[i].getAttribute('style');

            if (styleAttribute.match('.*https://i9?.ytimg.com/(vi|vi_webp)/.*/(hq1|hq2|hq3|hqdefault|mqdefault|hq720)(_custom_[0-9]+)?.jpg?.*')) {

                let newStyleAttribute = styleAttribute.replace(/(hq1|hq2|hq3|hqdefault|mqdefault|hq720)(_custom_[0-9]+)?.jpg/, `${newImage}.jpg`);

                if (!newStyleAttribute.match('.*stringtokillcache.*')) {
                    // messes up existing query parameters that might be there, but that's ok.
                    newStyleAttribute = newStyleAttribute.replace(/"\);$/, '?stringtokillcache");')
                }

                backgroundImgElements[i].style = newStyleAttribute;
            }
        }
    }
}
