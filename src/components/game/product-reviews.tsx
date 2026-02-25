"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient, ApiError } from "@/lib/api";
import type { Review, ReviewStats, ReviewSentiment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

// ────────────────────────────────────────────────────────────────
// Sentiment helpers
// ────────────────────────────────────────────────────────────────
const sentimentConfig: Record<ReviewSentiment, { label: string; color: string; emoji: string }> = {
  positive: { label: "Positivo", color: "bg-green-500/15 text-green-400 border-green-500/30", emoji: "😄" },
  neutral: { label: "Neutral", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", emoji: "😐" },
  negative: { label: "Negativo", color: "bg-red-500/15 text-red-400 border-red-500/30", emoji: "😞" },
  mixed: { label: "Mixto", color: "bg-purple-500/15 text-purple-400 border-purple-500/30", emoji: "🤔" },
};

// ────────────────────────────────────────────────────────────────
// Star Rating selector
// ────────────────────────────────────────────────────────────────
function StarRating({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={cn(
            "transition-all duration-150 hover:scale-110 focus:outline-none disabled:cursor-not-allowed",
            (hover || value) >= star ? "text-yellow-400" : "text-muted-foreground/30"
          )}
        >
          <Star className={cn("h-7 w-7", (hover || value) >= star && "fill-current")} />
        </button>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Read-only star display
// ────────────────────────────────────────────────────────────────
function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            rating >= star ? "text-yellow-400 fill-yellow-400" : rating >= star - 0.5 ? "text-yellow-400 fill-yellow-400/50" : "text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────
export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Data
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formText, setFormText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Check if user already reviewed
  const userReview = reviews.find((r) => r.user.id === user?.id);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await ApiClient.getProductReviews(productId, { page, limit: 5, sort });
      setReviews(res.reviews || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch {
      // silently fail
    }
  }, [productId, page, sort]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await ApiClient.getProductRatingStats(productId);
      setStats(res.data);
    } catch {
      // silently fail
    }
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchReviews(), fetchStats()]).finally(() => setLoading(false));
  }, [fetchReviews, fetchStats]);

  // ── Submit review ──
  const handleSubmit = async () => {
    if (!formRating) {
      toast({ title: "Seleccioná una calificación", variant: "destructive" });
      return;
    }
    if (formText.length < 10) {
      toast({ title: "La reseña debe tener al menos 10 caracteres", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await ApiClient.createReview(productId, {
        rating: formRating,
        title: formTitle || undefined,
        text: formText,
      });
      toast({ title: "¡Reseña publicada!", description: "Gracias por tu opinión." });
      setShowForm(false);
      setFormRating(0);
      setFormTitle("");
      setFormText("");
      setPage(1);
      // Refetch
      await Promise.all([fetchReviews(), fetchStats()]);
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : "Error al publicar la reseña";
      toast({ title: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpful vote ──
  const handleHelpful = async (reviewId: string) => {
    if (!user) {
      toast({ title: "Iniciá sesión para votar", variant: "destructive" });
      return;
    }
    try {
      const res = await ApiClient.voteReviewHelpful(reviewId);
      // Optimistic update
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpfulCount: res.data.helpfulCount } : r
        )
      );
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : "Error al votar";
      toast({ title: message, variant: "destructive" });
    }
  };

  // ── Delete review ──
  const handleDelete = async (reviewId: string) => {
    try {
      await ApiClient.deleteReview(reviewId);
      toast({ title: "Reseña eliminada" });
      await Promise.all([fetchReviews(), fetchStats()]);
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : "Error al eliminar";
      toast({ title: message, variant: "destructive" });
    }
  };

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-bold border-l-4 border-primary pl-4 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Reseñas de Jugadores
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* ───── STATS SUMMARY ───── */}
          {stats && stats.totalReviews > 0 && (
            <div className="bg-card/40 backdrop-blur-sm border border-white/5 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-center">
                {/* Average */}
                <div className="text-center md:text-left space-y-1">
                  <div className="text-5xl font-bold text-foreground">{stats.averageRating}</div>
                  <StarDisplay rating={stats.averageRating} size="md" />
                  <p className="text-sm text-muted-foreground">{stats.totalReviews} reseña{stats.totalReviews !== 1 ? "s" : ""}</p>
                </div>

                {/* Distribution bars */}
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.distribution[star] || 0;
                    const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="w-4 text-right text-muted-foreground">{star}</span>
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        <Progress value={pct} className="h-2.5 flex-1 bg-white/5 [&>div]:bg-yellow-400" />
                        <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Sentiment Summary */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Análisis IA
                  </p>
                  {(["positive", "neutral", "negative", "mixed"] as ReviewSentiment[]).map((s) => {
                    const count = stats.sentiment[s] || 0;
                    if (count === 0) return null;
                    const cfg = sentimentConfig[s];
                    return (
                      <div key={s} className="flex items-center gap-2 text-xs">
                        <span>{cfg.emoji}</span>
                        <span className="text-muted-foreground">{cfg.label}</span>
                        <span className="font-medium text-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ───── WRITE REVIEW BUTTON / FORM ───── */}
          {user && !userReview && (
            <div>
              {!showForm ? (
                <Button onClick={() => setShowForm(true)} variant="outline" className="border-primary/30 hover:bg-primary/10">
                  <Star className="mr-2 h-4 w-4" />
                  Escribir una reseña
                </Button>
              ) : (
                <div className="bg-card/40 backdrop-blur-sm border border-white/5 rounded-xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <h3 className="font-semibold text-lg">Tu reseña para {productName}</h3>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Calificación *</label>
                    <StarRating value={formRating} onChange={setFormRating} disabled={submitting} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Título (opcional)</label>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Resumí tu experiencia en una frase"
                      maxLength={100}
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Reseña * (mín. 10 caracteres)</label>
                    <Textarea
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      placeholder="Contá qué te pareció el juego, qué te gustó y qué no..."
                      rows={4}
                      maxLength={2000}
                      disabled={submitting}
                    />
                    <p className="text-xs text-muted-foreground text-right">{formText.length}/2000</p>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analizando y publicando...
                        </>
                      ) : (
                        "Publicar reseña"
                      )}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowForm(false)} disabled={submitting}>
                      Cancelar
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Tu reseña será analizada por IA para detectar sentimiento automáticamente
                  </p>
                </div>
              )}
            </div>
          )}

          {!user && (
            <p className="text-sm text-muted-foreground">
              <a href="/login" className="text-primary hover:underline">Iniciá sesión</a> para dejar una reseña.
            </p>
          )}

          {/* ───── SORT & LIST ───── */}
          {(stats?.totalReviews ?? 0) > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {stats?.totalReviews} reseña{(stats?.totalReviews ?? 0) !== 1 ? "s" : ""}
                </p>
                <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
                  <SelectTrigger className="w-[180px] h-9 text-sm bg-card/40 border-white/10">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Más recientes</SelectItem>
                    <SelectItem value="helpful">Más útiles</SelectItem>
                    <SelectItem value="highest">Mayor calificación</SelectItem>
                    <SelectItem value="lowest">Menor calificación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    currentUserId={user?.id}
                    isAdmin={user?.role === "admin"}
                    onHelpful={handleHelpful}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground flex items-center px-3">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {stats?.totalReviews === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">Aún no hay reseñas</p>
              <p className="text-sm">Sé el primero en compartir tu opinión sobre este juego.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// REVIEW CARD
// ────────────────────────────────────────────────────────────────
function ReviewCard({
  review,
  currentUserId,
  isAdmin,
  onHelpful,
  onDelete,
}: {
  review: Review;
  currentUserId?: string;
  isAdmin?: boolean;
  onHelpful: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isOwner = currentUserId === review.user.id;
  const canDelete = isOwner || isAdmin;
  const initials = review.user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-card/30 border border-white/5 rounded-xl p-5 space-y-3 hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 bg-primary/20">
            {review.user.avatar ? (
              <AvatarImage src={review.user.avatar} alt={review.user.name} />
            ) : null}
            <AvatarFallback className="text-xs font-bold text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{review.user.name}</span>
              {review.verified && (
                <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400 gap-1 px-1.5 py-0">
                  <ShieldCheck className="h-3 w-3" />
                  Compra verificada
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarDisplay rating={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Sentiment badge */}
        {review.sentiment && (
          <Badge variant="outline" className={cn("text-[10px] gap-1 px-2 py-0.5 shrink-0", sentimentConfig[review.sentiment].color)}>
            <Sparkles className="h-3 w-3" />
            {sentimentConfig[review.sentiment].emoji} {sentimentConfig[review.sentiment].label}
          </Badge>
        )}
      </div>

      {/* Title */}
      {review.title && <h4 className="font-semibold text-sm">{review.title}</h4>}

      {/* Text */}
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{review.text}</p>

      {/* Sentiment keywords */}
      {review.sentimentKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {review.sentimentKeywords.map((kw) => (
            <Badge key={kw} variant="secondary" className="text-[10px] bg-white/5 text-muted-foreground font-normal">
              {kw}
            </Badge>
          ))}
        </div>
      )}

      <Separator className="bg-white/5" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-primary h-7 px-2 gap-1.5"
          onClick={() => onHelpful(review.id)}
          disabled={isOwner}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Útil ({review.helpfulCount})
        </Button>

        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-red-400 h-7 px-2 gap-1.5"
            onClick={() => onDelete(review.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        )}
      </div>
    </div>
  );
}
