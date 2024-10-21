export type Author = { name: string, id?: `${bigint}`; };

export interface BunnyManifest {
    id: string;
    display: {
        name: string;
        description?: string;
        authors?: Author[];
    };
    extras?: {
        [key: string]: any;
    };
}
