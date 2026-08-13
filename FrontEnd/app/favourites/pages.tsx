"use client";

import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/components/providers/favorites-provider";

export default function FavoritesPage() {
  const { favoriteItems, removeFromFavorites } = useFavorites();

  return (
    <div className="min-h-screen bg-[#fdf6f0] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">My Favorites</h1>

            <p className="text-sm text-gray-500">
              {favoriteItems.length} favorite{" "}
              {favoriteItems.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {/* Empty */}
        {favoriteItems.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-200" />

            <h2 className="text-xl font-semibold text-gray-700">
              No favorites yet
            </h2>

            <p className="text-gray-500 mt-2">
              Add your favorite dishes from the menu.
            </p>
          </div>
        ) : (
          /* Favorites */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favoriteItems.map((item: any) => {
              const id = item._id ?? item.id;

              return (
                <div
                  key={id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border"
                >
                  {/* Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title || item.name || "Food item"}
                      className="w-full h-48 object-cover"
                    />
                  )}

                  <div className="p-4">
                    {/* Name */}
                    <h2 className="font-semibold text-lg">
                      {item.title || item.name}
                    </h2>

                    {/* Price */}
                    {item.price !== undefined && (
                      <p className="text-lg font-semibold text-orange-600 mt-2">
                        ₹{item.price}
                      </p>
                    )}

                    {/* Remove */}
                    <Button
                      variant="outline"
                      className="w-full mt-4 text-red-500 hover:text-red-600"
                      onClick={() => removeFromFavorites(id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove from Favorites
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
