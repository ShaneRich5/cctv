import React from "react";

// MosaicTVGrid.jsx
// Default-exported React component. TailwindCSS required in your project.
// Usage:
// <MosaicTVGrid videos={[{ id: '1', title: 'Morning Show', src: 'https://www.youtube.com/embed/VIDEO_ID', isLive: true }, ...]} columns={4} />

export default function MosaicTVGrid({ videos = [], columns = 4, gap = 6 }) {
  const sample = [
    {
      id: "yt1",
      title: "Live: City Cam",
      src: "https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_LjQHig",
      isLive: true,
    },
    {
      id: "yt2",
      title: "Concert Feed",
      src: "https://www.youtube.com/embed/live_stream?channel=UC-lHJZR3Gqxm24_Vd_AJ5Yw",
      isLive: true,
    },
    {
      id: "yt3",
      title: "Gaming Stream",
      src: "https://www.youtube.com/embed/live_stream?channel=UC_x5XG1OV2P6uZZ5FSM9Ttw",
      isLive: false,
    },
    {
      id: "yt4",
      title: "Talk Show",
      src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      isLive: false,
    },
  ];

  const list = videos.length ? videos : sample;

  // calculate responsive grid columns (Tailwind utility classes won't be dynamic easily here,
  // so we use CSS grid styles inline.)
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: `${gap * 4}px`,
  };

  return (
    <div className="mosaic-tv-grid p-4">
      <div className="grid" style={gridStyle}>
        {list.map((v, i) => (
          <TVCard key={v.id || i} video={v} index={i} />
        ))}
      </div>
    </div>
  );
}

function TVCard({ video, index }) {
  // tv "bezel" sizes vary a bit to create mosaic feeling
  const bezelVariants = ["translate-y-0", "-translate-y-2", "translate-y-2"];
  const bezelShift = bezelVariants[index % bezelVariants.length];

  // allow both iframe src and plain image thumbnails
  const isIframe =
    typeof video.src === "string" && video.src.includes("youtube");

  return (
    <div className={`relative ${bezelShift} transform transition-all`}>
      {/* Outer retro TV frame */}
      <div className="bg-gray-900 rounded-2xl p-3 shadow-2xl flex flex-col">
        {/* top controls & channel */}
        <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-sm" />
            <div className="font-medium">{video.title}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px]">
              CH {String(Math.abs(hashCode(video.title || "0")) % 999)}
            </div>
          </div>
        </div>

        {/* screen area */}
        <div className="relative bg-black rounded-xl overflow-hidden border-4 border-gray-800 shadow-inner">
          {/* scanlines & vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)",
              backgroundSize: "100% 4px",
              mixBlendMode: "overlay",
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.08), rgba(0,0,0,0.35))",
            }}
          />

          {/* Video (iframe or thumbnail) */}
          <div className="relative" style={{ paddingTop: "56.25%" /* 16:9 */ }}>
            {isIframe ? (
              <iframe
                title={video.title}
                src={
                  video.src +
                  (video.src.includes("?") ? "&" : "?") +
                  "autoplay=0&muted=1&controls=1"
                }
                allow="autoplay; encrypted-media; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-presentation"
                className="absolute inset-0 w-full h-full border-0"
              />
            ) : video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-400">
                No preview
              </div>
            )}
          </div>

          {/* Live badge */}
          {video.isLive && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-white">LIVE</span>
            </div>
          )}

          {/* bottom overlay - title */}
          <div className="absolute left-0 right-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <div className="text-xs text-gray-100 truncate">{video.title}</div>
          </div>
        </div>

        {/* speaker grill and feet to make it look like a TV */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-20 h-3 bg-gray-800 rounded-full grid grid-cols-10 gap-1 p-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-1 rounded-sm bg-gray-700" />
              ))}
            </div>
            <div className="text-[10px] text-gray-400">HD</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gray-700 flex items-center justify-center text-xs text-gray-200">
              ⏺
            </div>
            <div className="w-8 h-8 rounded-md bg-gray-700 flex items-center justify-center text-xs text-gray-200">
              ▣
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// tiny hash for channel number generation
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // convert to 32bit
  }
  return hash;
}

/*
Notes:
- This component expects TailwindCSS in your project.
- The sample embeds use YouTube "embed/live_stream?channel=..." URLs — replace with proper embed URLs for your streams.
- Autoplay and muted policies are browser-dependent; this code sets autoplay=0 and muted=1 by default in the iframe src params.
- To change the mosaic density, pass columns prop (e.g., columns={3}).
- Feel free to swap iframes for <video> tags or HLS players (hls.js) if you need low-latency live playback.
*/
