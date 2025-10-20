import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/chat');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-primary">
        <div className="animate-pulse">
          <MessageSquare className="w-12 h-12 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center text-white">
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl">
          <MessageSquare className="w-10 h-10" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Connect, Chat,
          <br />
          Collaborate
        </h1>
        
        <p className="text-xl md:text-2xl mb-12 text-white/80 max-w-2xl mx-auto">
          Join conversations, share ideas, and stay connected with your team in real-time
        </p>
        
        <Button
          onClick={() => navigate('/login')}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 transition-all text-lg px-8 py-6 rounded-xl shadow-lg"
        >
          Get Started
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
