import Pocketbase, { type RecordModel } from "pocketbase";
import { PocketSyncRecordList } from "./PocketSyncRecordList";

export class PocketSync<T extends RecordModel> {
    private pb: Pocketbase;
    private collectionName: string;
    public loading = true;

    constructor(databaseURL: string, collection: string) {
        this.collectionName = collection;
        this.pb = new Pocketbase(databaseURL);
    }

    public list() {
        let array: PocketSyncRecordList<T>;
        array = new PocketSyncRecordList<T>(this.pb, this.collectionName);
        return array;
    }

    public async addRecord(recordData: Partial<T>) {
        if (!this.pb) {
            throw new Error("Project instance not created");
        }

        if (!recordData) {
            throw new Error("Missing required data: recordData");
        }

        const formData = new FormData();

        for (const [key, value] of Object.entries(recordData)) {
            formData.append(key, value as string);
        }

        try {
            const newRecord = await this.pb.collection(this.collectionName).create(formData);
            return newRecord;
        } catch (error) {
            throw new Error("Error uploading file");
        }
    }

    public async deleteRecord(id: string) {
        if (!id) {
            throw new Error("Record ID required");
        }

        try {
            this.pb.collection(this.collectionName).delete(id);
        } catch (error) {
            console.error(error);
            throw new Error("Error deleting record");
        }
    }

    public async updateItem(options: { id: string, updatedKeys: Partial<T> }) {
        try {
            await this.pb.collection(this.collectionName).update<T>(options.id, options.updatedKeys);
        } catch (error) {
            console.error("Error updating item: ", error);
        }
    }
}