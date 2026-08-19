import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  useReactFlow,
} from '@xyflow/react';
import DiagramNode from './DiagramNode.jsx';
import PropertiesPanel from './PropertiesPanel.jsx';
import { clearProject, loadProject, saveProject } from './storage.js';

const DEFAULT_COLOR = '#2563eb';
const nodeTypes = { diagramNode: DiagramNode };

function makeId(prefix = 'node') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeNode(position, label = 'Nouveau bloc', color = DEFAULT_COLOR) {
  return {
    id: makeId(),
    type: 'diagramNode',
    position,
    data: {
      label,
      color,
      attachment: null,
    },
  };
}

function makeEdge(source, target) {
  return {
    id: makeId('edge'),
    source,
    target,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 2 },
  };
}

function DiagramEditor() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [projectName, setProjectName] = useState('Sans titre');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [saveState, setSaveState] = useState('Prêt');
  const [contextMenu, setContextMenu] = useState(null);
  const [showNewProjectConfirm, setShowNewProjectConfirm] = useState(false);
  const importInputRef = useRef(null);
  const saveTimerRef = useRef(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  useEffect(() => {
    let mounted = true;

    loadProject()
      .then((project) => {
        if (!mounted || !project) return;
        setNodes(Array.isArray(project.nodes) ? project.nodes : []);
        setEdges(Array.isArray(project.edges) ? project.edges : []);
        setProjectName(project.name || 'Sans titre');
      })
      .catch(() => {
        setSaveState('Stockage local indisponible');
      })
      .finally(() => {
        if (mounted) setIsReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    setSaveState('Sauvegarde…');
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      try {
        await saveProject({
          format: 'diagram-editor',
          version: 1,
          name: projectName,
          nodes,
          edges,
          savedAt: new Date().toISOString(),
        });
        setSaveState('Sauvegardé');
      } catch {
        setSaveState('Erreur de sauvegarde');
      }
    }, 450);

    return () => window.clearTimeout(saveTimerRef.current);
  }, [nodes, edges, projectName, isReady]);

  const onNodesChange = useCallback(
    (changes) => setNodes((current) => applyNodeChanges(changes, current)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((current) => applyEdgeChanges(changes, current)),
    [],
  );

  const onConnect = useCallback((connection) => {
    setEdges((current) => addEdge({
      ...connection,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
    }, current));
  }, []);

  const addNodeAt = useCallback((position, label = 'Nouveau bloc', color = DEFAULT_COLOR) => {
    const node = makeNode(position, label, color);
    setNodes((current) => [...current, node]);
    setSelectedNodeId(node.id);
    return node;
  }, []);

  const onPaneDoubleClick = useCallback((event) => {
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    addNodeAt(position);
  }, [screenToFlowPosition, addNodeAt]);

  const addNodeFromToolbar = useCallback(() => {
    const canvas = document.querySelector('.canvas-wrap');
    if (!canvas) {
      addNodeAt({ x: 80, y: 80 });
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const position = screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });

    addNodeAt(position);
  }, [screenToFlowPosition, addNodeAt]);

  const updateSelectedNode = useCallback((patch) => {
    if (!selectedNodeId) return;
    setNodes((current) => current.map((node) => (
      node.id === selectedNodeId
        ? { ...node, data: { ...node.data, ...patch } }
        : node
    )));
  }, [selectedNodeId]);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((current) => current.filter((node) => node.id !== selectedNodeId));
    setEdges((current) => current.filter((edge) => (
      edge.source !== selectedNodeId && edge.target !== selectedNodeId
    )));
    setSelectedNodeId(null);
  }, [selectedNodeId]);

  const duplicateSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    const duplicate = {
      ...selectedNode,
      id: makeId(),
      selected: false,
      position: {
        x: selectedNode.position.x + 36,
        y: selectedNode.position.y + 36,
      },
      data: { ...selectedNode.data },
    };
    setNodes((current) => [...current, duplicate]);
    setSelectedNodeId(duplicate.id);
  }, [selectedNode]);

  const addAfterNode = useCallback((nodeId) => {
    const parent = nodes.find((node) => node.id === nodeId);
    if (!parent) return;

    const child = makeNode(
      { x: parent.position.x + 260, y: parent.position.y },
      'Nouveau bloc',
      parent.data.color || DEFAULT_COLOR,
    );

    setNodes((current) => [...current, child]);
    setEdges((current) => [...current, makeEdge(parent.id, child.id)]);
    setSelectedNodeId(child.id);
    setContextMenu(null);
  }, [nodes]);

  const addAfterSelected = useCallback(() => {
    if (selectedNodeId) addAfterNode(selectedNodeId);
  }, [selectedNodeId, addAfterNode]);

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setSelectedNodeId(node.id);
    setContextMenu({
      nodeId: node.id,
      x: Math.min(event.clientX, window.innerWidth - 190),
      y: Math.min(event.clientY, window.innerHeight - 120),
    });
  }, []);

  const resetToNewProject = useCallback(async () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setProjectName('Sans titre');
    setContextMenu(null);
    setShowNewProjectConfirm(false);
    setSaveState('Nouveau diagramme');

    try {
      await clearProject();
    } catch {
      // L'état vide sera de toute façon réenregistré par l'autosauvegarde.
    }
  }, []);

  const createNewProject = useCallback(() => {
    setContextMenu(null);

    // Évite window.confirm(): certains aperçus / iframes bloquent les dialogues natifs.
    if (nodes.length || edges.length) {
      setShowNewProjectConfirm(true);
      return;
    }

    resetToNewProject();
  }, [nodes.length, edges.length, resetToNewProject]);

  const exportProject = () => {
    const project = {
      format: 'diagram-editor',
      version: 1,
      name: projectName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (projectName || 'diagramme')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'diagramme';

    link.href = url;
    link.download = `${safeName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProject = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const project = JSON.parse(reader.result);
        if (!Array.isArray(project.nodes) || !Array.isArray(project.edges)) {
          throw new Error('Format invalide');
        }
        setNodes(project.nodes);
        setEdges(project.edges);
        setProjectName(project.name || file.name.replace(/\.json$/i, '') || 'Sans titre');
        setSelectedNodeId(null);
        setContextMenu(null);
        window.setTimeout(() => fitView({ padding: 0.18, duration: 250 }), 50);
      } catch {
        window.alert('Ce fichier ne semble pas être un diagramme valide.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (isTyping) return;

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        event.preventDefault();
        deleteSelectedNode();
      }

      if (event.key === 'Escape') {
        setContextMenu(null);
        setSelectedNodeId(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedNodeId, deleteSelectedNode]);

  return (
    <div className="app-shell" onClick={() => contextMenu && setContextMenu(null)}>
      <header className="topbar">
        <div className="topbar__brand">
          <div className="brand-mark">◇</div>
          <div>
            <strong>Éditeur de diagrammes</strong>
            <span>{saveState}</span>
          </div>
        </div>

        <input
          className="project-name"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          aria-label="Nom du diagramme"
        />

        <div className="topbar__actions">
          <button className="toolbar-button add-block-button" onClick={addNodeFromToolbar}>＋ Ajouter un bloc</button>
          <button className="toolbar-button" onClick={createNewProject}>Nouveau</button>
          <button className="toolbar-button" onClick={() => importInputRef.current?.click()}>Importer</button>
          <button className="toolbar-button primary" onClick={exportProject}>Exporter</button>
          <input
            ref={importInputRef}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={importProject}
          />
        </div>
      </header>

      <main className="workspace">
        <section className="canvas-wrap">
          {nodes.length === 0 && (
            <div className="empty-hint" aria-hidden="true">
              <strong>Clique sur « Ajouter un bloc » pour commencer</strong>
              <span>Tu peux aussi double-cliquer n'importe où dans le canevas.</span>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onPaneDoubleClick={onPaneDoubleClick}
            onPaneClick={() => setSelectedNodeId(null)}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onNodeContextMenu={onNodeContextMenu}
            onNodesDelete={(deleted) => {
              if (deleted.some((node) => node.id === selectedNodeId)) setSelectedNodeId(null);
            }}
            fitView
            minZoom={0.15}
            maxZoom={2.4}
            deleteKeyCode={null}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={24} size={1.2} />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeColor={(node) => node.data?.color || DEFAULT_COLOR}
              maskColor="rgba(241, 245, 249, 0.74)"
            />
          </ReactFlow>
        </section>

        <PropertiesPanel
          node={selectedNode}
          onUpdate={updateSelectedNode}
          onDelete={deleteSelectedNode}
          onDuplicate={duplicateSelectedNode}
          onAddAfter={addAfterSelected}
        />
      </main>


      {showNewProjectConfirm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowNewProjectConfirm(false)}>
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-project-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="new-project-title">Nouveau diagramme</h2>
            <p>Créer un nouveau diagramme vide? Le diagramme actuel restera disponible seulement si tu l'as exporté.</p>
            <div className="confirm-dialog__actions">
              <button className="toolbar-button" onClick={() => setShowNewProjectConfirm(false)}>Annuler</button>
              <button className="danger-button" onClick={resetToNewProject}>Créer le nouveau</button>
            </div>
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button onClick={() => addAfterNode(contextMenu.nodeId)}>＋ Ajouter un bloc après</button>
          <button onClick={() => {
            setSelectedNodeId(contextMenu.nodeId);
            setContextMenu(null);
            window.setTimeout(duplicateSelectedNode, 0);
          }}>⧉ Dupliquer</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <DiagramEditor />
    </ReactFlowProvider>
  );
}
