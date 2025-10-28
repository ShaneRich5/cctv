import "./app.css";
import { hurricaneLivestreamList } from "./data";

type Video = { videoId: string; title: string };

interface YouTubeLiveProps {
  video: Video;
}

const YouTubeLive: React.FC<YouTubeLiveProps> = ({ video }) => {
  return (
    <div className="relative aspect-video w-full">
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-xl"
        src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&mute=1`}
        title={video.title ?? "YouTube Live Stream"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

function App() {
  return (
    <div className="px-4">
      <header className="text-center my-2">
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-2xl">
          CCTV Feed
        </h1>
      </header>
      <div className="grid grid-cols-2 gap-2">
        {hurricaneLivestreamList.map(
          (hurricaneLivestream: any, idx: number) => (
            <YouTubeLive key={idx} video={hurricaneLivestream} />
          )
        )}
      </div>
    </div>
  );
}

export default App;
