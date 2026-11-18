import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from 'lucide-react';
import { imageUrl } from '../api.js';

export default function GoogleSearchEditor({
  results = [], conversationTitle = '', onAdd, onUpdate, onUpdateQuery, onDelete, onMove, onDuplicate, onUpload,
}) {
  const updateResult = (index, key, value) => {
    const result = results[index];
    onUpdate(index, {
      metadata: {
        ...result.metadata,
        googleResult: { ...result.metadata?.googleResult, [key]: value },
      },
    });
  };
  const queryAt = result => result.metadata?.googleResult?.query?.trim() || conversationTitle.trim();

  return <section className="editor-panel google-search-editor">
    <div className="section-head">
      <div>
        <span className="eyebrow">RÉSULTATS DE RECHERCHE · ORDONNER POUR LA VIDÉO</span>
        <h2>Résultats <small>{results.length} éléments</small></h2>
      </div>
      <button className="primary-button compact" onClick={onAdd}><Plus size={15}/> Ajouter un résultat</button>
    </div>
    {results.length === 0
      ? <div className="google-results-empty">Ajoutez des résultats pour construire votre page de recherche.</div>
      : <div className="google-results-editor-list">{results.map((result, index) => (
        <article className="google-result-editor" key={result.clientKey || result.id || `google-result-${index}`}>
          {(!index || queryAt(result) !== queryAt(results[index - 1])) && <label>Recherche Google
            <input value={queryAt(result)} placeholder="Ex. comment retrouver un appareil perdu ?" onChange={event => onUpdateQuery(index, event.target.value)}/>
          </label>}
          <div className="google-result-editor-head">
            <span>RÉSULTAT {index + 1}</span>
            <div className="icon-actions">
              <button title="Monter" disabled={index === 0} onClick={() => onMove(index, -1)}><ArrowUp size={14}/></button>
              <button title="Descendre" disabled={index === results.length - 1} onClick={() => onMove(index, 1)}><ArrowDown size={14}/></button>
              <button title="Dupliquer" onClick={() => onDuplicate(index)}><Copy size={14}/></button>
              <button title="Supprimer" onClick={() => onDelete(index)}><Trash2 size={14}/></button>
            </div>
          </div>
          <label>Titre du résultat
            <input value={result.content || ''} placeholder="Ex. Guide complet : votre recherche" onChange={event => onUpdate(index, { content: event.target.value })}/>
          </label>
          <label>Adresse du site
            <input type="url" value={result.metadata?.googleResult?.url || ''} placeholder="https://exemple.com/article" onChange={event => updateResult(index, 'url', event.target.value)}/>
          </label>
          <label>Nom du site
            <input value={result.metadata?.googleResult?.siteName || ''} placeholder="Déduit automatiquement de l’URL" onChange={event => updateResult(index, 'siteName', event.target.value)}/>
          </label>
          <label>Extrait
            <textarea rows="3" value={result.metadata?.googleResult?.snippet || ''} placeholder="Une description claire et concise du contenu de cette page…" onChange={event => updateResult(index, 'snippet', event.target.value)}/>
          </label>
          <label>URL de l’image
            <input type="url" value={result.metadata?.googleResult?.image || ''} placeholder="https://exemple.com/image.jpg" onChange={event => updateResult(index, 'image', event.target.value)}/>
          </label>
          <div className="google-result-image-controls">
            <label className="google-image-upload">Importer une image
              <input type="file" accept="image/*" onChange={event => {
                const file = event.target.files?.[0];
                if (file) onUpload(index, file);
                event.target.value = '';
              }}/>
            </label>
            {result.metadata?.googleResult?.image && <button type="button" className="google-image-remove" onClick={() => updateResult(index, 'image', '')}>Retirer l’image</button>}
          </div>
          {result.metadata?.googleResult?.image && <img className="google-editor-image-preview" src={imageUrl(result.metadata.googleResult.image)} alt="Aperçu de l’image du résultat"/>}
        </article>
      ))}</div>}
  </section>;
}
