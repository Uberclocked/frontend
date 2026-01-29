import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCartItem } from "@/services/Cart";
import { getProductBySkuPublic } from "@/services/Product";
import { createReview, getProductRating, getReviewsByProduct } from "@/services/Review";

import ReviewCarousel from "../components/ReviewCarousel";
import type { Product } from "../types/Entities";
import type { CreateReviewDto, ProductRatingDto, ReviewResponseDto } from "../types/Review";

export default function ProductDetailPage() {
    const { skuPrefix } = useParams();
    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently, user } = useAuth0();

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<ReviewResponseDto[]>([]);
    const [rating, setRating] = useState<ProductRatingDto | null>(null);

    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [adding, setAdding] = useState(false);

    const [stars, setStars] = useState<number>(5);
    const [message, setMessage] = useState("");

    const productId = skuPrefix ?? ""; // en tu backend usás String, acá mandamos skuPrefix

    async function load() {
        if (!skuPrefix) return;
        setLoading(true);
        try {
            const p = await getProductBySkuPublic(skuPrefix);
            setProduct(p);

            const [rv, rt] = await Promise.all([
                getReviewsByProduct(productId),
                getProductRating(productId),
            ]);

            setReviews(rv);
            setRating(rt);
        } catch (e) {
            console.error(e);
            setProduct(null);
            setReviews([]);
            setRating(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skuPrefix]);

    const imageSrc = useMemo(() => {
        if (!product?.image) return "/placeholder.png";
        return `data:image/jpeg;base64,${product.image}`;
    }, [product?.image]);

    async function handleAddToCart() {
        if (!product) return;

        try {
            if (!isAuthenticated) {
                await loginWithRedirect();
                return;
            }
            setAdding(true);
            const token = await getAccessTokenSilently();
            await addCartItem(token, {
                productSku: product.skuPrefix,
                quantity: 1,
                components: {},
            });
            alert("Added to cart!");
        } catch (e) {
            console.error(e);
            alert("Could not add to cart");
        } finally {
            setAdding(false);
        }
    }

    async function handleCreateReview() {
        if (!isAuthenticated) {
            await loginWithRedirect();
            return;
        }
        if (!productId) return;

        const dto: CreateReviewDto = {
            skuPrefix: productId,
            qualification: Math.min(5, Math.max(1, stars)),
            message: message.trim(),
        };

        if (!dto.message) {
            alert("Write a message");
            return;
        }

        setPosting(true);
        try {
            const token = await getAccessTokenSilently();
            await createReview(token, dto);
            setMessage("");
            setStars(5);
            await load();
        } catch (e) {
            console.error(e);
            alert("Could not post review");
        } finally {
            setPosting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
                <p className="text-gray-200 text-lg">Loading...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
                <p className="text-gray-200 text-lg">Product not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 p-6">
            <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                    <div className="rounded-2xl bg-white p-4">
                        <img src={imageSrc} alt={product.name} className="h-80 w-full object-contain" />
                    </div>

                    <h1 className="mt-6 text-3xl font-bold text-[#FF8000]">{product.name}</h1>
                    <p className="mt-2 text-gray-200 text-xl font-semibold">${Number(product.price).toFixed(2)}</p>
                    <p className="mt-2 text-gray-300">Stock: <span className="text-gray-100 font-semibold">{product.stock}</span></p>

                    {rating && (
                        <p className="mt-3 text-gray-300">
                            Rating:{" "}
                            <span className="text-gray-100 font-semibold">
                {rating.avgRating.toFixed(2)}
              </span>{" "}
                            ({rating.count} reviews)
                        </p>
                    )}

                    <div className="mt-6">
                        <Button
                            className="w-full bg-[#FF8000] text-black hover:bg-[#e67300]"
                            onClick={handleAddToCart}
                            disabled={adding}
                        >
                            {adding ? "Adding..." : "Add to cart"}
                        </Button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {Object.entries(product.attributes ?? {}).map(([k, v]) => (
                            <span key={k} className="px-3 py-1 rounded-xl bg-gray-950 border border-gray-800 text-gray-200 text-sm">
                {k}: {String(v)}
              </span>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">Reviews</h2>
                        <ReviewCarousel reviews={reviews} />
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">Write a review</h2>

                        <div className="flex items-center gap-3">
                            <label className="text-gray-300 text-sm">Stars</label>
                            <select
                                value={stars}
                                onChange={(e) => setStars(Number(e.target.value))}
                                className="rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
                            >
                                {[5, 4, 3, 2, 1].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>

                            <span className="ml-auto text-gray-400 text-sm">
                {isAuthenticated ? (user?.name ?? "You") : "Login required"}
              </span>
                        </div>

                        <Input
                            placeholder="Write your review..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="mt-3 bg-gray-950 text-gray-100 border-gray-800"
                        />

                        <Button
                            className="mt-4 w-full bg-[#FF8000] text-black hover:bg-[#e67300]"
                            onClick={handleCreateReview}
                            disabled={posting}
                        >
                            {posting ? "Posting..." : "Submit review"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
