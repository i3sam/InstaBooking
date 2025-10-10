import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Star, Check, X, Clock, MessageSquare, Calendar, User, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  pageId: string;
  reviewerName: string;
  reviewerEmail: string | null;
  rating: number;
  reviewText: string | null;
  isApproved: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  pages: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function ReviewsList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch all reviews for user's pages
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['/api/user/reviews'],
  });

  // Update review status mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const response = await apiRequest('PATCH', `/api/reviews/${id}/status`, {
        isApproved: status,
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === 'approved' ? 'Review approved!' : 'Review declined',
        description:
          variables.status === 'approved'
            ? 'The review is now visible on your booking page.'
            : 'The review has been declined and will not be shown.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/reviews'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update review status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Filter reviews by status
  const pendingReviews = reviews.filter((r) => r.isApproved === 'pending');
  const approvedReviews = reviews.filter((r) => r.isApproved === 'approved');
  const rejectedReviews = reviews.filter((r) => r.isApproved === 'rejected');

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderReviewCard = (review: Review) => {
    const isPending = review.isApproved === 'pending';
    const isApproved = review.isApproved === 'approved';
    const isRejected = review.isApproved === 'rejected';

    return (
      <Card
        key={review.id}
        className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-xl hover-lift mobile-no-blur"
        data-testid={`review-card-${review.id}`}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full glass-prism backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate" data-testid={`text-reviewer-${review.id}`}>
                      {review.reviewerName}
                    </h3>
                    {review.reviewerEmail && (
                      <p className="text-sm text-muted-foreground truncate">{review.reviewerEmail}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {renderStars(review.rating)}
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              <Badge
                variant={isPending ? 'secondary' : isApproved ? 'default' : 'destructive'}
                className={`flex-shrink-0 ${
                  isPending
                    ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30'
                    : isApproved
                    ? 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30'
                    : 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30'
                }`}
                data-testid={`badge-status-${review.id}`}
              >
                {isPending && <Clock className="h-3 w-3 mr-1" />}
                {isApproved && <Check className="h-3 w-3 mr-1" />}
                {isRejected && <X className="h-3 w-3 mr-1" />}
                {review.isApproved.charAt(0).toUpperCase() + review.isApproved.slice(1)}
              </Badge>
            </div>

            {/* Review Text */}
            {review.reviewText && (
              <div className="glass-prism-card backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-foreground text-sm leading-relaxed" data-testid={`text-review-${review.id}`}>
                    {review.reviewText}
                  </p>
                </div>
              </div>
            )}

            {/* Page Info */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">For:</span>
              <span className="text-sm font-medium text-foreground">{review.pages.title}</span>
              <a
                href={`/${review.pages.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                data-testid={`link-view-page-${review.id}`}
              >
                View Page
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Actions */}
            {isPending && (
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => updateReviewMutation.mutate({ id: review.id, status: 'approved' })}
                  disabled={updateReviewMutation.isPending}
                  className="flex-1 glass-prism-button bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 text-green-700 dark:text-green-300 border border-green-500/30"
                  data-testid={`button-approve-${review.id}`}
                >
                  {updateReviewMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={() => updateReviewMutation.mutate({ id: review.id, status: 'rejected' })}
                  disabled={updateReviewMutation.isPending}
                  variant="outline"
                  className="flex-1 glass-prism-card bg-white/10 dark:bg-black/10 border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-500/10"
                  data-testid={`button-decline-${review.id}`}
                >
                  {updateReviewMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Decline
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Reviews
          </h2>
          <p className="text-gray-600 dark:text-gray-300">Manage customer reviews for your booking pages</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
          Reviews
        </h2>
        <p className="text-gray-600 dark:text-gray-300">Manage customer reviews for your booking pages</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-xl mobile-no-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400" data-testid="text-pending-count">
                  {pendingReviews.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl glass-prism backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-white/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-xl mobile-no-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Approved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-approved-count">
                  {approvedReviews.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl glass-prism backdrop-blur-md bg-gradient-to-br from-green-500/20 to-green-600/20 border border-white/30 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-xl mobile-no-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Declined</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-declined-count">
                  {rejectedReviews.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl glass-prism backdrop-blur-md bg-gradient-to-br from-red-500/20 to-red-600/20 border border-white/30 flex items-center justify-center">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 p-1 mobile-no-blur">
          <TabsTrigger
            value="pending"
            className="text-foreground data-[state=active]:glass-prism-button data-[state=active]:text-white"
            data-testid="tab-pending"
          >
            Pending {pendingReviews.length > 0 && `(${pendingReviews.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="text-foreground data-[state=active]:glass-prism-button data-[state=active]:text-white"
            data-testid="tab-approved"
          >
            Approved {approvedReviews.length > 0 && `(${approvedReviews.length})`}
          </TabsTrigger>
          <TabsTrigger
            value="declined"
            className="text-foreground data-[state=active]:glass-prism-button data-[state=active]:text-white"
            data-testid="tab-declined"
          >
            Declined {rejectedReviews.length > 0 && `(${rejectedReviews.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingReviews.length === 0 ? (
            <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-xl mobile-no-blur">
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No pending reviews</h3>
                <p className="text-muted-foreground">
                  New reviews will appear here for you to approve or decline.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">{pendingReviews.map(renderReviewCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedReviews.length === 0 ? (
            <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-xl mobile-no-blur">
              <CardContent className="p-12 text-center">
                <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No approved reviews</h3>
                <p className="text-muted-foreground">
                  Approved reviews will be displayed on your booking pages.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">{approvedReviews.map(renderReviewCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="declined" className="space-y-4">
          {rejectedReviews.length === 0 ? (
            <Card className="glass-prism-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 shadow-xl mobile-no-blur">
              <CardContent className="p-12 text-center">
                <X className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No declined reviews</h3>
                <p className="text-muted-foreground">
                  Declined reviews will not be shown on your booking pages.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">{rejectedReviews.map(renderReviewCard)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
