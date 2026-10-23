import { useState } from 'react';
import { Package, Laptop, Video, Camera, Microscope, Wrench, Volume2, Box, Eye } from 'lucide-react';

interface ItemImageProps {
  src?: string;
  alt: string;
  category?: string;
  className?: string;
  showZoom?: boolean;
}

export function ItemImage({ src, alt, category, className = 'w-full h-full', showZoom = true }: ItemImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const getCategoryIcon = () => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('elektronik') || cat.includes('it') || cat.includes('komputer')) {
      return <Laptop className="w-8 h-8 text-slate-500" />;
    }
    if (cat.includes('audio') || cat.includes('visual') || cat.includes('proyektor')) {
      return <Video className="w-8 h-8 text-slate-500" />;
    }
    if (cat.includes('kamera') || cat.includes('multimedia')) {
      return <Camera className="w-8 h-8 text-slate-500" />;
    }
    if (cat.includes('lab') || cat.includes('fisika') || cat.includes('kimia')) {
      return <Microscope className="w-8 h-8 text-slate-500" />;
    }
    if (cat.includes('perkakas') || cat.includes('mesin') || cat.includes('teknik')) {
      return <Wrench className="w-8 h-8 text-slate-500" />;
    }
    if (cat.includes('sound') || cat.includes('suara')) {
      return <Volume2 className="w-8 h-8 text-slate-500" />;
    }
    return <Package className="w-8 h-8 text-slate-500" />;
  };

  const hasValidSrc = src && src.trim().length > 0 && !hasError;

  return (
    <>
      <div className={`relative group overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}>
        {hasValidSrc ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-center text-slate-500">
            {getCategoryIcon()}
            <span className="text-[11px] font-medium text-slate-600 mt-1 line-clamp-1">{alt}</span>
          </div>
        )}

        {hasValidSrc && showZoom && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(true);
            }}
            title="Perbesar Foto"
            className="absolute right-2 bottom-2 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isZoomed && hasValidSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl p-2 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-h-[80vh] w-auto object-contain rounded-lg mx-auto"
            />
            <div className="p-3 flex items-center justify-between border-t border-slate-100 mt-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{alt}</p>
                <p className="text-xs text-slate-500">{category || 'Inventaris Barang'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
