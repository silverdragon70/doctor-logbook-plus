import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, ImageIcon, Trash2, X, ZoomIn } from 'lucide-react';

const mockMedia = [
  { mediaId: '1', placeholder: true },
  { mediaId: '2', placeholder: true },
  { mediaId: '3', placeholder: true },
  { mediaId: '4', placeholder: true },
  { mediaId: '5', placeholder: true },
];

const MediaGalleryScreen = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[16px] font-bold text-foreground">Media Gallery</h1>
        <div className="flex gap-1">
          <button onClick={() => console.log('capture')} className="p-2 rounded-full hover:bg-muted text-primary">
            <Camera size={18} />
          </button>
        </div>
      </header>

      <div className="px-5 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-foreground">{mockMedia.length} Images</h3>
          <button onClick={() => console.log('select from gallery')} className="text-[12px] text-primary font-medium">
            + Add Image
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-2">
          {mockMedia.map((m) => (
            <div
              key={m.mediaId}
              onClick={() => setSelectedId(m.mediaId)}
              className="aspect-square bg-muted rounded-xl flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all relative group"
            >
              <ImageIcon size={28} className="text-muted-foreground" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 rounded-xl transition-colors flex items-center justify-center">
                <ZoomIn size={16} className="text-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
              </div>
            </div>
          ))}
          {/* Add Button */}
          <button
            onClick={() => console.log('add media')}
            className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Camera size={24} />
            <span className="text-[9px] font-bold mt-1">CAPTURE</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-[100] bg-foreground/90 flex items-center justify-center" onClick={() => setSelectedId(null)}>
          <button className="absolute top-4 right-4 text-background p-2" onClick={() => setSelectedId(null)}>
            <X size={24} />
          </button>
          <button
            className="absolute bottom-8 right-8 p-3 bg-destructive rounded-full text-destructive-foreground"
            onClick={(e) => { e.stopPropagation(); console.log('delete', selectedId); setSelectedId(null); }}
          >
            <Trash2 size={20} />
          </button>
          <div className="w-[300px] h-[300px] bg-muted rounded-2xl flex items-center justify-center">
            <ImageIcon size={64} className="text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGalleryScreen;
