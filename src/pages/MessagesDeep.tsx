import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useConversations } from '../hooks/queries/useMessages';
import ChatWindow from '../components/ChatWindow';

export default function MessagesDeep() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: conversations = [] } = useConversations(profile?.id);

  const conv = conversations.find((c) => c.id === conversationId);

  if (!profile || !conversationId) return null;

  return (
    <AnimatePresence>
      <ChatWindow
        conversationId={conversationId}
        currentUserId={profile.id}
        otherParticipant={conv?.other_participant ?? { id: '', name: null, avatar_url: null }}
        onBack={() => navigate('/messages')}
      />
    </AnimatePresence>
  );
}
