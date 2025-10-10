import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit, Save, X, StickyNote, Search, Pin, Archive, Tag, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  color: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

const noteColors = [
  { name: 'Blue', value: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700' },
  { name: 'Green', value: 'green', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300 dark:border-green-700' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-300 dark:border-yellow-700' },
  { name: 'Red', value: 'red', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-300 dark:border-purple-700' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-300 dark:border-pink-700' },
  { name: 'Gray', value: 'gray', bg: 'bg-gray-100 dark:bg-gray-900/30', border: 'border-gray-300 dark:border-gray-700' },
];

const categories = ['General', 'Work', 'Personal', 'Ideas', 'Meeting Notes', 'To-Do', 'Important'];

export default function Notes() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('General');
  const [editTags, setEditTags] = useState('');
  const [editColor, setEditColor] = useState('blue');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const { toast } = useToast();

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['/api/notes'],
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; category: string; tags: string; color: string }) => {
      const response = await apiRequest('POST', '/api/notes', data);
      if (!response.ok) throw new Error('Failed to create note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setIsCreating(false);
      setEditTitle('');
      setEditContent('');
      setEditCategory('General');
      setEditTags('');
      setEditColor('blue');
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

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
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

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
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
    setEditCategory(note.category || 'General');
    setEditTags(note.tags || '');
    setEditColor(note.color || 'blue');
  };

  const handleSaveEdit = () => {
    if (selectedNote) {
      updateNoteMutation.mutate({
        id: selectedNote.id,
        data: { title: editTitle, content: editContent, category: editCategory, tags: editTags, color: editColor },
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
    setEditCategory('General');
    setEditTags('');
    setEditColor('blue');
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
    createNoteMutation.mutate({ 
      title: editTitle, 
      content: editContent, 
      category: editCategory, 
      tags: editTags, 
      color: editColor 
    });
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setEditTitle('');
    setEditContent('');
    setEditCategory('General');
    setEditTags('');
    setEditColor('blue');
  };

  const togglePin = (note: Note) => {
    updateNoteMutation.mutate({
      id: note.id,
      data: { isPinned: !note.isPinned },
    });
  };

  const toggleArchive = (note: Note) => {
    updateNoteMutation.mutate({
      id: note.id,
      data: { isArchived: !note.isArchived },
    });
  };

  const getColorClasses = (color: string) => {
    const colorObj = noteColors.find(c => c.value === color);
    return colorObj || noteColors[0];
  };

  let filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.tags && note.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;
    const matchesArchive = showArchived ? note.isArchived : !note.isArchived;

    return matchesSearch && matchesCategory && matchesArchive;
  });

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);
  const sortedNotes = [...pinnedNotes, ...unpinnedNotes];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Notes
          </h2>
          <p className="text-muted-foreground mt-1">Keep track of important information</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={showArchived ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className={showArchived ? 'glass-prism-button bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' : 'glass-prism'}
            data-testid="button-toggle-archived"
          >
            {showArchived ? <Trash2 className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
            {showArchived ? 'Trash Bin' : 'Active Notes'}
          </Button>
          <Button
            onClick={() => {
              setIsCreating(true);
              setSelectedNote(null);
              setEditTitle('');
              setEditContent('');
              setEditCategory('General');
              setEditTags('');
              setEditColor('blue');
            }}
            className="glass-prism-button text-white shadow-lg"
            disabled={isCreating}
            data-testid="button-new-note"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass-prism-card backdrop-blur-xl bg-white/5 dark:bg-black/5 border-white/20 shadow-2xl animate-slide-in-left mobile-no-blur">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">
              All Notes ({sortedNotes.length})
            </CardTitle>
            <div className="space-y-3 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-prism bg-white/5 border-white/20"
                  data-testid="input-search-notes"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="glass-prism bg-white/5 border-white/20" data-testid="select-category-filter">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
              {sortedNotes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 glass-prism rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <StickyNote className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery || categoryFilter !== 'all' ? 'No notes found' : showArchived ? 'No archived notes' : 'No notes yet. Create your first note!'}
                  </p>
                </div>
              ) : (
                sortedNotes.map((note, index) => {
                  const colorClasses = getColorClasses(note.color);
                  return (
                    <button
                      key={note.id}
                      onClick={() => {
                        setSelectedNote(note);
                        setIsCreating(false);
                        setIsEditing(false);
                      }}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 group animate-fade-in border ${
                        selectedNote?.id === note.id
                          ? 'glass-prism-button text-white shadow-lg scale-[1.02]'
                          : `glass-prism hover:glass-prism-button ${colorClasses.bg} ${colorClasses.border}`
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      data-testid={`note-item-${note.id}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold truncate flex-1">{note.title}</h4>
                        {note.isPinned && <Pin className="h-3.5 w-3.5 ml-2 flex-shrink-0 fill-current" />}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white/80 line-clamp-2 mb-2">
                        {note.content || 'No content'}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {note.category}
                          </Badge>
                          {note.tags && note.tags.split(',').slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 group-hover:text-white/60 whitespace-nowrap">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

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
                        onClick={() => togglePin(selectedNote!)}
                        className="glass-prism"
                        disabled={updateNoteMutation.isPending}
                        data-testid="button-pin-note"
                      >
                        <Pin className={`h-4 w-4 mr-1 ${selectedNote?.isPinned ? 'fill-current' : ''}`} />
                        {selectedNote?.isPinned ? 'Unpin' : 'Pin'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleArchive(selectedNote!)}
                        className="glass-prism"
                        disabled={updateNoteMutation.isPending}
                        data-testid="button-archive-note"
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        {selectedNote?.isArchived ? 'Unarchive' : 'Archive'}
                      </Button>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Category</label>
                    <Select value={editCategory} onValueChange={setEditCategory}>
                      <SelectTrigger className="glass-prism bg-white/5 border-white/20" data-testid="select-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Color</label>
                    <Select value={editColor} onValueChange={setEditColor}>
                      <SelectTrigger className="glass-prism bg-white/5 border-white/20" data-testid="select-color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {noteColors.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${color.bg} ${color.border} border`} />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Tags (comma-separated)</label>
                  <Input
                    placeholder="e.g., urgent, meeting, project"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="glass-prism bg-white/5 border-white/20"
                    data-testid="input-tags"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Write your note here..."
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="glass-prism bg-white/5 border-white/20 min-h-[350px] resize-none"
                    data-testid="textarea-note-content"
                  />
                </div>
              </div>
            ) : selectedNote ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-start justify-between">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex-1">
                    {selectedNote.title}
                  </h3>
                  {selectedNote.isPinned && (
                    <Badge variant="secondary" className="ml-2">
                      <Pin className="h-3 w-3 mr-1 fill-current" />
                      Pinned
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{selectedNote.category}</Badge>
                  {selectedNote.tags && selectedNote.tags.split(',').map((tag, i) => (
                    <Badge key={i} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.trim()}
                    </Badge>
                  ))}
                  <Badge className={getColorClasses(selectedNote.color).bg}>
                    <Palette className="h-3 w-3 mr-1" />
                    {noteColors.find(c => c.value === selectedNote.color)?.name}
                  </Badge>
                </div>
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
