import Pocketbase from "pocketbase";
import type { RecordModel } from "pocketbase";

export class PocketSyncRecord<T extends RecordModel> {
    #pb: Pocketbase;
    public collectionName: string;
    public id: string;
    public record: T;

    constructor(record: T, pb: Pocketbase, collection: string) {
        this.id = record.id;
        this.collectionName = collection;
        this.#pb = pb;
        this.record = record;
    }

    public async delete() {
        if (!this.record) {
            throw new Error("Record ID required");
        }

        try {
            this.#pb.collection(this.collectionName).delete(this.record.id);
        } catch (error) {
            console.error(error);
            throw new Error("Error deleting record");
        }
    }

    public async update(updatedRecord: Partial<T>) {
        if (!updatedRecord) {
            throw new Error("updatedRecord required!");
        }

        try {
            await this.#pb.collection(this.collectionName).update<T>(this.record.id, updatedRecord);
        } catch (error) {
            console.error("Error updating item: ", error);
        }
    }
}