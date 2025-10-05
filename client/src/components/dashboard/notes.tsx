import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit, Save, X, StickyNote, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function Notes() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Fetch notes
  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['/api/notes'],
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const response = await apiRequest('POST', '/api/notes', data);
      if (!response.ok) throw new Error('Failed to create note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setIsCreating(false);
      setEditTitle('');
      setEditContent('');
      toast({
        title: 'Note created',
        description: 'Your note has been saved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create note. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { title: string; content: string } }) => {
      const response = await apiRequest('PATCH', `/api/notes/${id}`, data);
      if (!response.ok) throw new Error('Failed to update note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setIsEditing(false);
      toast({
        title: 'Note updated',
        description: 'Your changes have been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update note. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/notes/${id}`);
      if (!response.ok) throw new Error('Failed to delete note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setSelectedNote(null);
      toast({
        title: 'Note deleted',
        description: 'Your note has been removed.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete note. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleStartEdit = (note: Note) => {
    setIsEditing(true);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (selectedNote) {
      updateNoteMutation.mutate({
        id: selectedNote.id,
        data: { title: editTitle, content: editContent },
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
  };

  const handleCreateNote = () => {
    if (!editTitle.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your note.',
        variant: 'destructive',
      });
      return;
    }
    createNoteMutation.mutate({ title: editTitle, content: editContent });
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setEditTitle('');
    setEditContent('');
  };

  // Filter notes by search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Notes
          </h2>
          <p className="text-muted-foreground mt-1">Keep track of important information</p>
        </div>
        <Button
          onClick={() => {
            setIsCreating(true);
            setSelectedNote(null);
            setEditTitle('');
            setEditContent('');
          }}
          className="glass-prism-button text-white shadow-lg"
          disabled={isCreating}
          data-testid="button-new-note"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <Card className="glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl animate-slide-in-left mobile-no-blur">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
              All Notes ({notes.length})
            </CardTitle>
            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-prism bg-white/5 border-white/20"
                data-testid="input-search-notes"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 glass-prism rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <StickyNote className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? 'No notes found' : 'No notes yet. Create your first note!'}
                  </p>
                </div>
              ) : (
                filteredNotes.map((note, index) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsCreating(false);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 group animate-fade-in ${
                      selectedNote?.id === note.id
                        ? 'glass-prism-button text-white shadow-lg'
                        : 'glass-prism hover:glass-prism-button hover:scale-105'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    data-testid={`note-item-${note.id}`}
                  >
                    <h4 className="font-semibold mb-1 truncate">{note.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white/80 truncate">
                      {note.content || 'No content'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 group-hover:text-white/60 mt-2">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Note Editor */}
        <Card className="lg:col-span-2 glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl animate-slide-in-right mobile-no-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {isCreating ? 'New Note' : isEditing ? 'Edit Note' : 'Note Details'}
              </CardTitle>
              {(selectedNote || isCreating) && (
                <div className="flex gap-2">
                  {isEditing || isCreating ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={isCreating ? handleCancelCreate : handleCancelEdit}
                        className="glass-prism"
                        data-testid="button-cancel-edit"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={isCreating ? handleCreateNote : handleSaveEdit}
                        className="glass-prism-button text-white"
                        disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
                        data-testid="button-save-note"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(selectedNote!)}
                        className="glass-prism"
                        data-testid="button-edit-note"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteNoteMutation.mutate(selectedNote!.id)}
                        disabled={deleteNoteMutation.isPending}
                        data-testid="button-delete-note"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isCreating || isEditing ? (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <Input
                    placeholder="Note title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="glass-prism bg-white/5 border-white/20 text-lg font-semibold"
                    data-testid="input-note-title"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Write your note here..."
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="glass-prism bg-white/5 border-white/20 min-h-[400px] resize-none"
                    data-testid="textarea-note-content"
                  />
                </div>
              </div>
            ) : selectedNote ? (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {selectedNote.title}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="glass-prism p-6 rounded-xl whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {selectedNote.content || 'No content'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 glass-prism rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <StickyNote className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No note selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select a note from the list or create a new one
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
