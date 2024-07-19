import Pocketbase, { type RecordModel } from "pocketbase";
import { PocketSyncRecordList } from "./PocketSyncRecordList";

export class PocketSync<T extends RecordModel> {
    #pb: Pocketbase;
    public collectionName: string;

    constructor(databaseURL: string, collection: string) {
        this.collectionName = collection;
        this.#pb = new Pocketbase(databaseURL);
    }

    public list() {
        let array: PocketSyncRecordList<T>;
        array = new PocketSyncRecordList<T>(this.#pb, this.collectionName);
        return array;
    }
}