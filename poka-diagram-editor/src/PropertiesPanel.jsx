const COLORS = [
  '#2563eb',
  '#7c3aed',
  '#16a34a',
  '#ea580c',
  '#dc2626',
  '#0891b2',
  '#475569',
  '#111827',
];

export default function PropertiesPanel({
  node,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddAfter,
}) {
  if (!node) {
    return (
      <aside className="properties-panel properties-panel--empty">
        <div>
          <h2>Propriétés</h2>
          <p>Sélectionne un bloc pour modifier son texte, sa couleur ou lui joindre un dessin.</p>
        </div>
      </aside>
    );
  }

  const attachment = node.data.attachment;

  const handleAttachment = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({
        attachment: {
          name: file.name,
          type: file.type || 'application/octet-stream',
          dataUrl: reader.result,
        },
      });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <aside className="properties-panel">
      <div className="properties-panel__header">
        <div>
          <span className="eyebrow">Bloc sélectionné</span>
          <h2>Propriétés</h2>
        </div>
        <button className="icon-button" onClick={onDelete} title="Supprimer le bloc" aria-label="Supprimer le bloc">
          ×
        </button>
      </div>

      <label className="field">
        <span>Texte</span>
        <textarea
          rows="3"
          value={node.data.label || ''}
          onChange={(event) => onUpdate({ label: event.target.value })}
          placeholder="Texte du bloc"
        />
      </label>

      <div className="field">
        <span>Couleur</span>
        <div className="color-grid">
          {COLORS.map((color) => (
            <button
              key={color}
              className={`color-swatch${node.data.color === color ? ' is-active' : ''}`}
              style={{ background: color }}
              onClick={() => onUpdate({ color })}
              aria-label={`Choisir la couleur ${color}`}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="field">
        <span>Dessin ou document</span>
        <label className="file-button">
          {attachment ? 'Remplacer le fichier' : 'Ajouter un fichier'}
          <input type="file" accept="image/*,application/pdf" onChange={handleAttachment} />
        </label>
      </div>

      {attachment && (
        <div className="attachment-card">
          <div className="attachment-card__topline">
            <strong>{attachment.name}</strong>
            <button className="text-button danger" onClick={() => onUpdate({ attachment: null })}>
              Retirer
            </button>
          </div>

          <div className="attachment-preview">
            {attachment.type.startsWith('image/') ? (
              <img src={attachment.dataUrl} alt={attachment.name} />
            ) : attachment.type === 'application/pdf' ? (
              <iframe src={attachment.dataUrl} title={attachment.name} />
            ) : (
              <p>Aperçu non disponible.</p>
            )}
          </div>
        </div>
      )}

      <div className="panel-actions">
        <button className="secondary-button" onClick={onAddAfter}>Ajouter après</button>
        <button className="secondary-button" onClick={onDuplicate}>Dupliquer</button>
        <button className="danger-button" onClick={onDelete}>Supprimer</button>
      </div>
    </aside>
  );
}
