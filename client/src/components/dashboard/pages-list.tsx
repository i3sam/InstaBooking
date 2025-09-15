import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreatePageModal from '@/components/modals/create-page-modal';
import { Plus, ExternalLink, Edit, Eye } from 'lucide-react';
import { useLocation } from 'wouter';

export default function PagesList() {
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: pages = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/pages'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Booking Pages</h2>
          <p className="text-muted-foreground">Create and manage your booking pages</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
          data-testid="button-create-page"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Page
        </Button>
      </div>

      {pages.length === 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-dashed border-border">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-80">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Create Your First Page</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Set up a booking page for your services and start accepting appointments
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                variant="default"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page: any) => (
            <Card key={page.id} className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                {page.logoUrl ? (
                  <img 
                    src={page.logoUrl} 
                    alt={`${page.title} logo`}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {page.title?.charAt(0) || 'B'}
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">{page.title}</h3>
                  <div className="w-3 h-3 bg-green-500 rounded-full" title="Active"></div>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{page.tagline}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>bookinggen.com/{page.slug}</span>
                  <span>0 bookings</span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    data-testid={`button-edit-${page.slug}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="default"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                    onClick={() => setLocation(`/${page.slug}`)}
                    data-testid={`button-view-${page.slug}`}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Add new page card */}
          <Card className="border-2 border-dashed border-border">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-80">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Create New Page</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Set up another booking page for different services
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                variant="default"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                data-testid="button-create-another-page"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <CreatePageModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
}
