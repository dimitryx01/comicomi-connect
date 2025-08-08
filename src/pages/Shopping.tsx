
import { useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingListCard } from '@/components/shopping/ShoppingListCard';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import PageLayout from '@/components/layout/PageLayout';

const Shopping = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  const {
    activeLists,
    archivedLists,
    loading,
    createList,
    updateListTitle,
    toggleListCompletion,
    deleteList,
    addItem,
    toggleItemCheck,
    deleteItem
  } = useShoppingLists();

  const handleCreateList = async () => {
    if (newListName.trim()) {
      await createList(newListName.trim());
      setNewListName('');
      setIsCreateDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <PageLayout showFooter={false}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Listas de Compras</h1>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg border p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showFooter={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Listas de Compras</h1>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Lista
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Lista</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nombre de la lista..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateList} className="flex-1">
                    Crear
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Activas ({activeLists.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archivadas ({archivedLists.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeLists.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="font-semibold mb-2">No tienes listas activas</h3>
                  <p className="text-muted-foreground mb-4">
                    Crea tu primera lista de compras o agrega ingredientes desde una receta
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primera lista
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLists.map((list) => (
                  <ShoppingListCard
                    key={list.id}
                    id={list.id}
                    title={list.title}
                    isCompleted={list.is_completed}
                    items={list.items}
                    onUpdateTitle={updateListTitle}
                    onToggleCompletion={toggleListCompletion}
                    onDelete={deleteList}
                    onAddItem={addItem}
                    onToggleItem={toggleItemCheck}
                    onDeleteItem={deleteItem}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="space-y-6">
            {archivedLists.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-4xl mb-4">📦</div>
                  <h3 className="font-semibold mb-2">No hay listas archivadas</h3>
                  <p className="text-muted-foreground">
                    Las listas finalizadas aparecerán aquí
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archivedLists.map((list) => (
                  <ShoppingListCard
                    key={list.id}
                    id={list.id}
                    title={list.title}
                    isCompleted={list.is_completed}
                    items={list.items}
                    onUpdateTitle={updateListTitle}
                    onToggleCompletion={toggleListCompletion}
                    onDelete={deleteList}
                    onAddItem={addItem}
                    onToggleItem={toggleItemCheck}
                    onDeleteItem={deleteItem}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Shopping;
