import { useLayoutEffect, useRef, useState } from 'react';
import { faAmazon, faFacebook, faInstagram, faLinkedin, faRedditAlien, faTiktok, faWikipediaW, faXTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { Camera, Globe2, Search, Wifi } from 'lucide-react';
import { siGoogle, siNetflix } from 'simple-icons';
import { imageUrl } from '../api.js';

const brandSites = [
  { domains: ['tiktok.com'], name: 'TikTok', icon: faTiktok, color: '#111111' },
  { domains: ['facebook.com'], name: 'Facebook', icon: faFacebook, color: '#0866ff' },
  { domains: ['youtube.com', 'youtu.be'], name: 'YouTube', icon: faYoutube, color: '#ff0033' },
  { domains: ['instagram.com'], name: 'Instagram', icon: faInstagram, color: '#c13584' },
  { domains: ['reddit.com'], name: 'Reddit', icon: faRedditAlien, color: '#ff4500' },
  { domains: ['wikipedia.org'], name: 'Wikipédia', icon: faWikipediaW, color: '#202122' },
  { domains: ['linkedin.com'], name: 'LinkedIn', icon: faLinkedin, color: '#0a66c2' },
  { domains: ['x.com', 'twitter.com'], name: 'X', icon: faXTwitter, color: '#111111' },
  { domains: ['amazon.com', 'amazon.fr', 'amazon.co.uk', 'amazon.de'], name: 'Amazon', icon: faAmazon, color: '#ff9900' },
  { domains: ['netflix.com'], name: 'Netflix', simpleIcon: siNetflix, color: '#e50914' },
  { domains: ['google.com'], name: 'Google', simpleIcon: siGoogle, color: '#4285f4' },
];

const parsedHost = value => {
  if (!value?.trim()) return '';
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) ? url.hostname.replace(/^www\./i, '').toLowerCase() : '';
  } catch {
    return '';
  }
};

const siteFor = (url, customName) => {
  const host = parsedHost(url);
  const brand = brandSites.find(site => site.domains.some(domain => host === domain || host.endsWith(`.${domain}`)));
  return {
    host,
    name: customName?.trim() || brand?.name || host || 'Site web',
    brand,
  };
};

const safeImageSource = (value, publicBaseUrl) => {
  if (!value?.trim()) return '';
  if (value.startsWith('/uploads/') && publicBaseUrl) return `${publicBaseUrl.replace(/\/$/, '')}${value}`;
  if (value.startsWith('/uploads/')) return imageUrl(value);
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

function SearchFavicon({ site }) {
  const brand = site.brand;
  return <span className={`google-result-favicon ${brand ? 'has-brand-icon' : ''}`} style={brand ? { '--favicon-color': brand.color } : undefined} aria-label={`${site.name} favicon`}>
    {brand?.simpleIcon
      ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d={brand.simpleIcon.path}/></svg>
      : brand?.icon
        ? <svg viewBox={`0 0 ${brand.icon.icon[0]} ${brand.icon.icon[1]}`} aria-hidden="true">
          {(Array.isArray(brand.icon.icon[4]) ? brand.icon.icon[4] : [brand.icon.icon[4]]).map((path, index) => <path key={index} d={path}/>)}
        </svg>
        : <Globe2 aria-hidden="true"/>}
  </span>;
}

function ResultThumbnail({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img className="google-result-image" src={src} alt={alt} loading="eager" onError={() => setFailed(true)}/>;
}

function GoogleWordmark() {
  return <span className="google-wordmark" aria-label="Google">
    <i>G</i><i>o</i><i>o</i><i>g</i><i>l</i><i>e</i>
  </span>;
}

export default function GoogleSearchPreview({
  conversation = {}, results = [], idPrefix = '', className = '', deterministic = false, renderMode = 'phone-mockup', shake = 0,
  appearance = 'light', publicBaseUrl,
}) {
  const searchId = idPrefix ? `${idPrefix}-phone-screen` : 'phone-screen';
  const resultsId = idPrefix ? `${idPrefix}-chat-canvas` : 'chat-canvas';
  const resultsRef = useRef(null);
  const activeQuery = [...results].reverse().find(result => result.metadata?.googleResult?.query?.trim())?.metadata.googleResult.query.trim() || conversation.title || '';
  const hasQueryGroups = results.some(result => result.metadata?.googleResult?.query?.trim());
  const currentResults = hasQueryGroups
    ? results.filter(result => result.metadata?.googleResult?.query?.trim() === activeQuery)
    : results;
  useLayoutEffect(() => {
    if (resultsRef.current) resultsRef.current.scrollTop = resultsRef.current.scrollHeight;
  }, [currentResults.length, activeQuery]);
  return <div
    className={`phone-frame ${className} ${deterministic ? `remotion-phone-frame remotion-${renderMode}` : ''}`}
    style={deterministic && shake ? { transform: `translate(${Math.sin(shake * .24) * 1.15 + Math.sin(shake * .71) * .35}px,${Math.sin(shake * .19) * .8}px) scale(4.5) scale(1.003)` } : undefined}
  >
    <div id={searchId} className={`phone-screen google-search-screen google-appearance-${appearance}`} lang={conversation.language || 'fr'}>
      <div className="android-camera" aria-hidden="true"/>
      <div className="statusbar">
        <span>9:41</span>
        <div className="status-icons"><span className="signal-bars"><i/><i/><i/><i/></span><span className="network-label">5G</span><Wifi className="google-wifi"/><span className="battery-icon"><i/><b/></span></div>
      </div>
      <header className="google-app-header">
        <GoogleWordmark/>
        <span className="google-profile-avatar" aria-label="Compte Google">A</span>
      </header>
      <div className="google-search-box">
        <Search aria-hidden="true"/>
        <span>{activeQuery || 'Rechercher sur Google'}</span>
        <span className="google-search-tools" aria-hidden="true"><i>●</i><Camera/></span>
      </div>
      <nav className="google-search-tabs" aria-label="Filtres de recherche">
        <span className="active">Tous</span><span>Images</span><span>Vidéos</span><span>Actualités</span><span>Maps</span>
      </nav>
      <div id={resultsId} className="google-search-results" ref={resultsRef}>
        {currentResults.length === 0
          ? <div className="google-no-results">Aucun résultat pour le moment.</div>
          : currentResults.map((result, index) => {
            const url = result.metadata?.googleResult?.url || '';
            const site = siteFor(url, result.metadata?.googleResult?.siteName);
            const title = result.content?.trim() || `Informations utiles sur ${activeQuery}`;
            const snippet = result.metadata?.googleResult?.snippet?.trim();
            const image = safeImageSource(result.metadata?.googleResult?.image || result.image, publicBaseUrl);
            return <article className={`google-search-result ${image ? 'has-image' : ''}`} key={result.id || result.clientKey || `result-${index}`}>
              <div className="google-result-source">
                <SearchFavicon site={site}/>
                <span><b>{site.name}</b><small>{url || site.host || 'Résultat de recherche'}</small></span>
                <span className="google-result-menu" aria-hidden="true">⋮</span>
              </div>
              <div className="google-result-body">
                <div className="google-result-copy">
                  <h2>{title}</h2>
                  {snippet && <p>{snippet}</p>}
                </div>
                <ResultThumbnail src={image} alt={title}/>
              </div>
            </article>;
          })}
      </div>
      <footer className="google-bottom-bar" aria-hidden="true">
        <span className="selected"><Search/>Rechercher</span><span><i>◎</i>Découvrir</span><span><i>◷</i>Enregistrés</span>
      </footer>
    </div>
  </div>;
}
