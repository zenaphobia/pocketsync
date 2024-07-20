# PocketSync

PocketSync is a TypeScript library that integrates with Pocketbase to provide real-time updates using the realtime API. It simplifies database connections for your frontend and supports CRUD operations.

## Usage

1. Initialize a PocketSync Collection.

```
interface Dog {
    name: string;
    breed: string;
    // other fields
}

const pocketbaseURL = 'https://your-pocketbase-url';
const collectionName = 'your-collection-name';
const collection = new PocketSync<Dog>(pocketbaseURL, collectionName);
```

2. List your records with `list()`, if using svelte, you can use auto subscribers. The store returns an object with two properties: `{ loading: boolean, items: PocketSyncRecord<T>[] }`

```
<script lang="ts">
    import { PocketSync } from 'pocketsync';
    import type { Dog } from './path-to-your-types';

    const pocketbaseURL = 'https://your-pocketbase-url';
    const collectionName = 'your-collection-name';
    const collection = new PocketSync<Dog>(pocketbaseURL, collectionName);

    let fileStore = collection.list();
</script>

{#each $fileStore.items as file}
    <span>{file.record.name}</span>
{/each}
```

## CRUD Operations

1. Adding a record.

```
import { PocketSync } from 'pocketsync';
import type { Dog } from './path-to-your-types';

const pocketbaseURL = 'https://your-pocketbase-url';
const collectionName = 'your-collection-name';
const collection = new PocketSync<Dog>(pocketbaseURL, collectionName);
const fileStore = collection.list();

const newRecord: Partial<Dog> = {
    name: 'Kaya'
    // other fields
};

fileStore.addRecord(newRecord);
```

2. Deleting a record.

```
import { PocketSync } from 'pocketsync';
import type { Dog } from './path-to-your-types';

const pocketbaseURL = 'https://your-pocketbase-url';
const collectionName = 'your-collection-name';
const collection = new PocketSync<Dog>(pocketbaseURL, collectionName);
const fileStore = collection.list();

$: singleFile = $fileStore.items[0];

singleFile.delete();

// OR

fileStore.delete(singleFile.id);
```

3. Updating a record.

```
import { PocketSync } from 'pocketsync';
import type { Dog } from './path-to-your-types';

const pocketbaseURL = 'https://your-pocketbase-url';
const collectionName = 'your-collection-name';
const collection = new PocketSync<Dog>(pocketbaseURL, collectionName);
const fileStore = collection.list();

$: singleFile = $fileStore[0];

const updatedRecord: Partial<Dog> = {
    name: 'Updated Record'
    // other fields
};

singleFile.update(updatedRecord);
```
