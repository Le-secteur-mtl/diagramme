import { Handle, Position } from '@xyflow/react';

export default function DiagramNode({ data, selected }) {
  return (
    <div
      className={`diagram-node${selected ? ' is-selected' : ''}`}
      style={{ '--node-accent': data.color || '#2563eb' }}
      title={data.attachment?.name ? `Pièce jointe : ${data.attachment.name}` : undefined}
    >
      <Handle type="target" position={Position.Left} className="node-handle" />
      <div className="diagram-node__label">{data.label || 'Bloc'}</div>
      {data.attachment && <span className="diagram-node__attachment" aria-label="Pièce jointe">📎</span>}
      <Handle type="source" position={Position.Right} className="node-handle" />
    </div>
  );
}
