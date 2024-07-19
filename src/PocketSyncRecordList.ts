import { type RecordModel } from "pocketbase";
import Pocketbase from "pocketbase";
import { PocketSyncRecord } from "./PocketSyncRecord";

export class PocketSyncRecordList<T extends RecordModel> {
    #pb: Pocketbase;
    private cache: Map<string, PocketSyncRecord<T>> = new Map();
    private store: { loading: boolean, items: PocketSyncRecord<T>[] };
    private subscribers: Array<(value: { loading: boolean, items: PocketSyncRecord<T>[] }) => void> = [];
    private collectionName: string;

    constructor(pb: Pocketbase, collection: string) {
        this.#pb = pb;
        this.store = { loading: false, items: [] };
        this.collectionName = collection;
        this.initSubscription(collection);
        this.initCache(collection);
    }

    private updateStore(event: any) {
        this.store.loading = true;
        this.notifySubscribers();
        if (event.action === 'delete') {
            this.cache.delete(event.record.id);
        } else {
            const _newRecord = new PocketSyncRecord(event.record, this.#pb, this.collectionName)
            this.cache.set(event.record.id, _newRecord);
        }
        this.store.items = [...this.cache.values()];
        this.store.loading = false;
        this.notifySubscribers();
    }

    private async initCache(collection: string) {
        const records = await this.#pb.collection(collection).getFullList<T>({ sort: '-created' });
        records.forEach((record: T) => {
            const _record = new PocketSyncRecord<T>(record, this.#pb, this.collectionName)
            this.cache.set(record.id, _record);
        });
        this.store.items = [...this.cache.values()];
        this.store.loading = false;
        this.notifySubscribers();
    }

    private initSubscription(collection: string) {
        if (!this.#pb) {
            throw new Error("db was not initialized");
        }
        this.#pb.collection(collection).subscribe('*', (event) => this.updateStore(event));
        console.log("Subscription initialized");
    }

    public async addRecord(recordData: Partial<T>) {

        if (!recordData) {
            throw new Error("Missing required data: recordData");
        }

        const formData = new FormData();

        for (const [key, value] of Object.entries(recordData)) {
            formData.append(key, value as string);
        }

        try {
            const newRecord = await this.#pb.collection(this.collectionName).create(formData, { requestKey: null });
            return newRecord;
        } catch (error) {
            console.error(error);
            throw new Error("Error uploading file");
        }
    }

    public async deleteRecord(item: string | PocketSyncRecord<T>) {
        if (!item) {
            throw new Error("Record ID or PocketSyncRecord item required");
        }

        const id = item instanceof PocketSyncRecord ? item.id : item;

        try {
            this.#pb.collection(this.collectionName).delete(id);
        } catch (error) {
            console.error(error);
            throw new Error("Error deleting record");
        }
    }

    public async updateRecord(options: { item: string | PocketSyncRecord<T>, updatedKeys: Partial<T> }) {
        if (!options) {
            throw new Error("Options parameter required");
        }

        const item = options.item instanceof PocketSyncRecord ? options.item.id : options.item;

        try {
            await this.#pb.collection(this.collectionName).update<T>(item, options.updatedKeys);
        } catch (error) {
            console.error("Error updating item: ", error);
        }
    }

    public subscribe(callback: (store: { loading: boolean, items: PocketSyncRecord<T>[] }) => void) {
        this.subscribers.push(callback);
        callback(this.store);
        return () => this.unsubscribe(callback);
    }

    public unsubscribe(callback: (store: { loading: boolean, items: PocketSyncRecord<T>[] }) => void) {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    }

    private notifySubscribers() {
        for (const subscriber of this.subscribers) {
            subscriber(this.store);
        }
    }
}