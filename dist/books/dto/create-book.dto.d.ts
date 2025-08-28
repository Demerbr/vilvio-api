export declare class CreateBookDto {
    title: string;
    author: string;
    isbn?: string;
    genre?: string;
    publicationYear?: number;
    publisher?: string;
    pages?: number;
    language?: string;
    availableCopies?: number;
    totalCopies: number;
    location?: string;
    description?: string;
    coverUrl?: string;
}
