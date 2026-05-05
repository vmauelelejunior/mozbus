const DB_NAME = 'mozbus-offline-db';
const STORE_NAME = 'pending-reservations';
const STORE_MANIFEST = 'passenger-manifests';

export interface PendingReservation {
    id?: number;
    tripId: string;
    seatNumber: number;
    passengerId: string;
    timestamp: number;
}

export interface ManifestPassenger {
    ticketId: string;
    passengerName: string;
    seatNumber: number;
    qrCode: string;
    isValidated: boolean;
    validatedAt?: number;
    tripId?: string;
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 2);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORE_MANIFEST)) {
                db.createObjectStore(STORE_MANIFEST, { keyPath: 'qrCode' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// --- FUNÇÕES DE RESERVA (RECUPERADAS) ---

export async function savePendingReservation(reservation: PendingReservation): Promise<number> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(reservation);
        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllPendingReservations(): Promise<PendingReservation[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function deletePendingReservation(id: number): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// --- FUNÇÕES DE MANIFESTO (FISCAL) ---

export async function saveManifest(tripId: string, passengers: ManifestPassenger[]): Promise<void> {
    const db = await openDB();
    const transaction = db.transaction(STORE_MANIFEST, 'readwrite');
    const store = transaction.objectStore(STORE_MANIFEST);
    passengers.forEach(p => store.put({ ...p, tripId }));
}

export async function validateTicketLocally(qrCode: string): Promise<{ success: boolean; passenger?: ManifestPassenger; message: string }> {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction(STORE_MANIFEST, 'readwrite');
        const store = transaction.objectStore(STORE_MANIFEST);
        const request = store.get(qrCode);

        request.onsuccess = () => {
            const passenger = request.result;
            if (!passenger) {
                resolve({ success: false, message: 'Bilhete Inválido ou Não Encontrado' });
                return;
            }
            if (passenger.isValidated) {
                resolve({ success: false, passenger, message: 'Bilhete JÁ UTILIZADO' });
                return;
            }
            
            passenger.isValidated = true;
            passenger.validatedAt = Date.now();
            store.put(passenger);
            resolve({ success: true, passenger, message: 'Embarque Autorizado' });
        };
        request.onerror = () => resolve({ success: false, message: 'Erro na base de dados local' });
    });
}

export async function getUnsyncedValidations(): Promise<ManifestPassenger[]> {
    const db = await openDB();
    const transaction = db.transaction(STORE_MANIFEST, 'readonly');
    const store = transaction.objectStore(STORE_MANIFEST);
    const all = await new Promise<ManifestPassenger[]>(r => {
        const req = store.getAll();
        req.onsuccess = () => r(req.result);
    });
    return all.filter(p => p.isValidated && p.validatedAt);
}
