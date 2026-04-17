let googleSdkPromise: Promise<void> | null = null;
let facebookSdkPromise: Promise<void> | null = null;

const loadScript = (src: string, id: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed loading script: ${src}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed loading script: ${src}`));
    document.head.appendChild(script);
  });

export const loadGoogleSdk = () => {
  if (!googleSdkPromise) {
    googleSdkPromise = loadScript('https://accounts.google.com/gsi/client', 'google-identity-sdk');
  }

  return googleSdkPromise;
};

export const loadFacebookSdk = (appId: string) => {
  if (!facebookSdkPromise) {
    facebookSdkPromise = new Promise<void>((resolve, reject) => {
      (window as Window & typeof globalThis & { fbAsyncInit?: () => void }).fbAsyncInit = () => {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v20.0',
        });
        resolve();
      };

      void loadScript('https://connect.facebook.net/en_US/sdk.js', 'facebook-jssdk').catch(reject);
    });
  }

  return facebookSdkPromise;
};
