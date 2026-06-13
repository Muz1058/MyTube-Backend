import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const ChannelPage = () => {
  const { username } = useParams();

  return (
    <div>
      <PageHeader title="Channel" description={`@${username}`} />
    </div>
  );
};

export default ChannelPage;
