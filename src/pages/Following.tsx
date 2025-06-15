
import { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PostCard from '@/components/post/PostCard';
import { posts } from '@/data/mockData';

const Following = () => {
  const [activeTab, setActiveTab] = useState('posts');

  // Mock following data
  const following = [
    {
      id: '1',
      name: 'Sarah Johnson',
      username: '@sarahcooks',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      followers: 1234,
      posts: 56,
      isFollowing: true
    },
    {
      id: '2',
      name: 'Chef Marco',
      username: '@chefmarco',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      followers: 5678,
      posts: 123,
      isFollowing: true
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Following</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'posts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </Button>
          <Button
            variant={activeTab === 'people' ? 'default' : 'outline'}
            onClick={() => setActiveTab('people')}
          >
            <Users className="h-4 w-4 mr-2" />
            People
          </Button>
        </div>
      </div>

      {activeTab === 'posts' && (
        <div className="space-y-6">
          {posts.slice(0, 3).map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}

      {activeTab === 'people' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {following.map((person) => (
            <Card key={person.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={person.avatar} />
                  <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{person.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{person.username}</p>
                </div>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Following
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{person.followers} followers</span>
                  <span>{person.posts} posts</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Following;
