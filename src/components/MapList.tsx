import { useState } from 'react';
import { ChapterMap } from '../types/map';
import { MapCard } from './MapCard';
import { useAuth } from '../contexts/AuthContext';
import { SignInModal } from './SignInModal';
import { MapEditorModal } from './MapEditorModal';

interface MapListProps {
  publicMaps: ChapterMap[];
  userMaps: ChapterMap[];
  onViewMap: (map: ChapterMap) => void;
  onEditMap: (map: ChapterMap) => void;
  onDeleteMap: (mapId: string) => void;
  onCreateMap: () => void;
  activeTab: 'public' | 'my-maps';
  onTabChange: (tab: 'public' | 'my-maps') => void;
}

export const MapList = ({
  publicMaps,
  userMaps,
  onViewMap,
  onEditMap,
  onDeleteMap,
  onCreateMap,
  activeTab,
  onTabChange
}: MapListProps) => {
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [selectedMap, setSelectedMap] = useState<ChapterMap | null>(null);

  const handleCardClick = (map: ChapterMap) => {
    if (!user && activeTab === 'my-maps') {
      setShowSignInModal(true);
      return;
    }
    setSelectedMap(map);
  };

  const handleCloseModal = () => {
    setSelectedMap(null);
  };

  const handleCreateClick = () => {
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    onCreateMap();
  };

  return (
    <div className="map-list-container">
      <div className="map-tabs">
        <button
          className={`tab-button ${activeTab === 'public' ? 'active' : ''}`}
          onClick={() => onTabChange('public')}
        >
          Public Maps
        </button>
        <button
          className={`tab-button ${activeTab === 'my-maps' ? 'active' : ''}`}
          onClick={() => onTabChange('my-maps')}
        >
          My Maps
        </button>
      </div>

      <div className="maps-container">
        {activeTab === 'public' ? (
          publicMaps.length > 0 ? (
            publicMaps.map(map => (
              <MapCard
                key={map.id}
                map={map}
                onCardClick={handleCardClick}
                isPublicView={true}
              />
            ))
          ) : (
            <p className="no-maps-message">No public maps available</p>
          )
        ) : (
          <>
            {userMaps.length > 0 ? (
              userMaps.map(map => (
                <MapCard
                  key={map.id}
                  map={map}
                  onCardClick={handleCardClick}
                  isPublicView={false}
                />
              ))
            ) : (
              <p className="no-maps-message">
                {user ? "You haven't created any maps yet" : "Sign in to create and view your maps"}
              </p>
            )}
            {user && (
              <button className="add-map-card" onClick={handleCreateClick}>
                <div className="add-map-content">
                  <span className="add-icon">+</span>
                  <span>Create New Map</span>
                </div>
              </button>
            )}
          </>
        )}
      </div>

      {showSignInModal && (
        <SignInModal onClose={() => setShowSignInModal(false)} />
      )}

      {selectedMap && (
        <MapEditorModal
          map={selectedMap}
          onClose={handleCloseModal}
          onSave={onEditMap}
          onDelete={onDeleteMap}
          isPublicView={activeTab === 'public'}
        />
      )}
    </div>
  );
}; 