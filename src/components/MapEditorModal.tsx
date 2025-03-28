import { useState } from 'react';
import { ChapterMap } from '../types/map';
import ForceGraph from './ForceGraph';
import { GraphData, GraphNode, Link } from '../types/graph';
import { ConfirmationModal } from './ConfirmationModal';

interface MapEditorModalProps {
  map: ChapterMap;
  onClose: () => void;
  onSave: (map: ChapterMap) => void;
  onDelete: (mapId: string) => void;
}

const SPECIAL_CHAPTERS = {
  '-1': 'Extracts',
  '0': 'Etymology',
  '136': 'Epilogue'
} as const;

export const MapEditorModal = ({ map, onClose, onSave, onDelete }: MapEditorModalProps) => {
  const [name, setName] = useState(map.name);
  const [description, setDescription] = useState(map.description || '');
  const [isPublic, setIsPublic] = useState(map.isPublic);
  const [selectedChapters, setSelectedChapters] = useState<Set<number>>(new Set(map.selectedChapters));
  const [graphData, setGraphData] = useState<GraphData>(convertToGraphData(selectedChapters));
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Generate array of all chapters in sequence (-1, 0, 1-135, 136)
  const allChapters = [-1, 0, ...Array.from({ length: 135 }, (_, i) => i + 1), 136];

  function convertToGraphData(selectedChapters: Set<number>): GraphData {
    const nodes: GraphNode[] = [];
    const links: Link[] = [];

    // Add the central theme node with the map's name as the theme
    nodes.push({
      id: 0,
      chapter: name, // Use the map's name as the theme
      connections: selectedChapters.size
    });

    // Create nodes and links for each chapter
    selectedChapters.forEach(chapter => {
      nodes.push({
        id: chapter,
        chapter: chapter,
        connections: 1
      });

      // Create links from the theme node to each chapter
      links.push({
        source: 0, // theme node
        target: chapter
      });
    });

    return { nodes, links };
  }

  const handleChapterClick = (chapter: number) => {
    const newSelectedChapters = new Set(selectedChapters);
    if (newSelectedChapters.has(chapter)) {
      newSelectedChapters.delete(chapter);
    } else {
      newSelectedChapters.add(chapter);
    }
    setSelectedChapters(newSelectedChapters);
    setGraphData(convertToGraphData(newSelectedChapters));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    console.log('Selected Chapters:', Array.from(selectedChapters)); // Log selectedChapters

    const updatedMap: ChapterMap = {
      ...map,
      name: name.trim(),
      description,
      userId: map.userId,
      isPublic,
      selectedChapters: Array.from(selectedChapters), // Save as flat array
      createdAt: map.createdAt,
      updatedAt: new Date(),
      id: map.id
    };
    onSave(updatedMap);
    onClose();
  };

  const getChapterStyle = (chapter: number) => {
    return selectedChapters.has(chapter) ? "chapter-button selected-primary" : "chapter-button";
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDelete(map.id);
    onClose();
  };

  return (
    <div className="map-editor-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <input
            type="text"
            placeholder="Map Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="name-input"
          />
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="editor-section">
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="description-input"
            />
            <div className="controls-row">
              <div className="visibility-toggle">
                <label className="toggle-label">
                  <span>{isPublic ? 'Public' : 'Private'}</span>
                  <div
                    className={`toggle-switch ${isPublic ? 'active' : ''}`}
                    onClick={() => setIsPublic(!isPublic)}
                  >
                    <div className="toggle-slider" />
                  </div>
                </label>
              </div>
              <div className="action-buttons">
                <button className="save-button" onClick={handleSave}>
                  {map.id ? 'Save Changes' : 'Save'}
                </button>
                <button className="delete-button" onClick={handleDeleteClick}>
                  Delete
                </button>
                <button className="cancel-button" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div className="chapter-bank">
            <h3>Select Chapters</h3>
            <p className="instructions">
              Click a chapter to select it. Then click other chapters to mark them as related. Then click "Add".
            </p>

            <div className="chapter-grid">
              {allChapters.map(chapter => (
                <button
                  key={chapter}
                  className={getChapterStyle(chapter)}
                  onClick={() => handleChapterClick(chapter)}
                  data-title={SPECIAL_CHAPTERS[String(chapter) as keyof typeof SPECIAL_CHAPTERS]}
                >
                  {chapter}
                </button>
              ))}
            </div>
          </div>

          <div className="graph-container">
            {graphData.nodes.length > 0 && (
              <ForceGraph
                data={graphData}
                width={800}
                height={600}
              />
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirmation && (
        <ConfirmationModal
          message="Are you sure you want to delete this map?"
          confirmText="Yes, delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}
    </div>
  );
}; 