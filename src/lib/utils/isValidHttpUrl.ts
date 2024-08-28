// https://stackoverflow.com/a/43467144/15031462
export default function isValidHttpUrl(input: string) {
    let url: URL;

    try {
        url = new URL(input);
    } catch {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}
