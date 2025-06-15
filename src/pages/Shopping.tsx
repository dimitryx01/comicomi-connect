
import { useState } from 'react';
import { Plus, ShoppingCart, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const Shopping = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Mock shopping lists data
  const [shoppingLists, setShoppingLists] = useState([
    {
      id: '1',
      name: 'Weekly Groceries',
      items: [
        { id: '1', name: 'Tomatoes', quantity: '2 kg', checked: false },
        { id: '2', name: 'Mozzarella', quantity: '200g', checked: true },
        { id: '3', name: 'Basil', quantity: '1 bunch', checked: false },
      ],
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Pizza Night',
      items: [
        { id: '4', name: 'Pizza dough', quantity: '2 pieces', checked: false },
        { id: '5', name: 'Olive oil', quantity: '1 bottle', checked: false },
      ],
      createdAt: '2024-01-14'
    }
  ]);

  const toggleItem = (listId: string, itemId: string) => {
    setShoppingLists(lists =>
      lists.map(list =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              )
            }
          : list
      )
    );
  };

  const createList = () => {
    if (newListName.trim()) {
      const newList = {
        id: Date.now().toString(),
        name: newListName,
        items: [],
        createdAt: new Date().toISOString().split('T')[0]
      };
      setShoppingLists([newList, ...shoppingLists]);
      setNewListName('');
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Shopping Lists</h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Shopping List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="List name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createList()}
              />
              <div className="flex gap-2">
                <Button onClick={createList} className="flex-1">Create</Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shoppingLists.map((list) => {
          const checkedItems = list.items.filter(item => item.checked).length;
          const totalItems = list.items.length;
          const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

          return (
            <Card key={list.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{list.name}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {checkedItems}/{totalItems}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {list.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => toggleItem(list.id, item.id)}
                    />
                    <span className={`flex-1 ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                      {item.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.quantity}
                    </span>
                  </div>
                ))}
                {list.items.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No items in this list yet
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Shopping;
