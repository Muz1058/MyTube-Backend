import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const VideoPage = () => {
  const { videoId } = useParams();

  return (
    <div>
      <PageHeader title="Video" description={`Video ID: ${videoId}`} />
    </div>
  );
};

export default VideoPage;
