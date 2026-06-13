import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const PlaylistPage = () => {
  const { playlistId } = useParams();

  return (
    <div>
      <PageHeader title="Playlist" description={`Playlist ID: ${playlistId}`} />
    </div>
  );
};

export default PlaylistPage;
