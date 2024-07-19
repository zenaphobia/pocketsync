import Pocketbase from "pocketbase";
import type { RecordModel } from "pocketbase";

export class PocketSyncRecord<T extends RecordModel> {
    #pb: Pocketbase;
    #collectionName: string;
    public loading = true;
    public id: string;
    public data: T;

    constructor(record: T, pb: Pocketbase, collection: string) {
        this.id = record.id;
        this.#collectionName = collection;
        this.#pb = pb;
        this.data = record;
    }

    public async delete() {
        if (!this.data) {
            throw new Error("Record ID required");
        }

        try {
            this.#pb.collection(this.#collectionName).delete(this.data.id);
        } catch (error) {
            console.error(error);
            throw new Error("Error deleting record");
        }
    }
}