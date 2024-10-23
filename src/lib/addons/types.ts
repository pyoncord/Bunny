export type Author = { name: string, id?: `${bigint}`; };

export interface BunnyManifest {
    readonly id: string;
    readonly version: string;
    readonly type: string;
    readonly display: {
        readonly name: string;
        readonly description?: string;
        readonly authors?: Author[];
    };
    readonly extras?: {
        readonly [key: string]: any;
    };
}
