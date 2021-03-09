const { electronapi } = window;

export function updateBrowserViewUrl(url) {
    return electronapi.updateUrl('send-to-browserview', url);
}
