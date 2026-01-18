// init interfaces for favorites 


export interface Favorite {
    id: number;
    user_id: string;
    verse_id: number;
    verse_reference: string;
    created_at: string;
    updated_at: string;
}

export interface FavoritesResponse {
    favorites: Favorite[];
    total: number;
    page: number;
    pageSize: number;

}

export interface AddFavoriteRequest {
    verse_id: number;
    verse_reference: string;
}

export interface AddFavoriteResponse {
    favorite: Favorite;
    
}