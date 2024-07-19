import { type RecordModel } from "pocketbase";
import Pocketbase from "pocketbase";
import { PocketSyncRecord } from "./PocketSyncRecord";

export class PocketSyncRecordList<T extends RecordModel> {
    #pb: Pocketbase;
    private cache: Map<string, PocketSyncRecord<T>> = new Map();
    private store: PocketSyncRecord<T>[] = [];
    private subscribers: Array<(value: PocketSyncRecord<T>[]) => void> = [];
    private collectionName: string;

    constructor(pb: Pocketbase, collection: string) {
        this.#pb = pb;
        this.store = [];
        this.collectionName = collection;
        this.initSubscription(collection);
        this.initCache(collection);
    }

    private updateItems(event: any) {
        if (event.action === 'delete') {
            this.cache.delete(event.record.id);
        } else {
            const _newRecord = new PocketSyncRecord(event.record, this.#pb, this.collectionName)
            this.cache.set(event.record.id, _newRecord);
        }
        this.store = [...this.cache.values()];
        this.notifySubscribers();
    }

    private async initCache(collection: string) {
        const records = await this.#pb.collection(collection).getFullList<T>({ sort: '-created' });
        records.forEach((record: T) => {
            const _record = new PocketSyncRecord<T>(record, this.#pb, this.collectionName)
            this.cache.set(record.id, _record);
        });
        this.store = [...this.cache.values()];
        this.notifySubscribers();
    }

    private initSubscription(collection: string) {
        if (!this.#pb) {
            throw new Error("db was not initialized");
        }
        this.#pb.collection(collection).subscribe('*', (event) => this.updateItems(event));
        console.log("Subscription initialized");
    }

    public async addRecord(recordData: Partial<T>) {

        if (!recordData) {
            throw new Error("Missing required data: recordData");
        }

        const formData = new FormData();

        for (const [key, value] of Object.entries(recordData)) {
            console.log(`${key}: ${value}`)
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

    public subscribe(callback: (store: PocketSyncRecord<T>[]) => void) {
        this.subscribers.push(callback);
        callback(this.store);
        return () => this.unsubscribe(callback);
    }

    public unsubscribe(callback: (store: PocketSyncRecord<T>[]) => void) {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    }

    private notifySubscribers() {
        for (const subscriber of this.subscribers) {
            subscriber(this.store);
        }
    }
}